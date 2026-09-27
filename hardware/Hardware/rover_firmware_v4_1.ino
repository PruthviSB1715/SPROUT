#include <WiFi.h>
#include <WiFiUdp.h>
#include <WebServer.h>
#include <DHT.h>
#include <ESP32Servo.h>

// ============================================================
// Wi-Fi Access Point Credentials (unchanged)
// ============================================================
const char* ssid = "Smart_Rover_AP";
const char* password = "p12345678";
const unsigned int localUdpPort = 12345;

// ============================================================
// Motor Pin Assignments (unchanged - do not touch)
// ============================================================
#define LF_IN1 26
#define LF_IN2 27
#define RF_IN3 25
#define RF_IN4 33

#define LB_IN1 14
#define LB_IN2 12
#define RB_IN3 18
#define RB_IN4 19

// ============================================================
// Sensor Pin Assignments (unchanged)
// ============================================================
#define DHT_PIN 4
#define DHT_TYPE DHT11
#define SOIL_PIN 34
#define MQ135_PIN 35

#define SERVO_PIN 13
Servo panServo;

DHT dht(DHT_PIN, DHT_TYPE);
WebServer server(80);

#define SOIL_DRY_RAW 3150
#define SOIL_WET_RAW 1235

WiFiUDP udp;
char packetBuffer[255];
unsigned long lastPacketTime = 0;

float cachedTemp = 0.0;
float cachedHumidity = 0.0;
int cachedSoilRaw = 0;
int cachedSoilPercent = 0;
int cachedMq135Raw = 0;
int cachedAirQualityIndex = 0;
unsigned long lastSensorReadTime = 0;
const unsigned long SENSOR_READ_INTERVAL = 2000;

int currentServoAngle = 90;

void setLeftMotors(int speed) {
  speed = constrain(speed, -255, 255);
  if (speed > 0) {
    analogWrite(LF_IN1, speed); analogWrite(LF_IN2, 0);
    analogWrite(LB_IN1, speed); analogWrite(LB_IN2, 0);
  } else if (speed < 0) {
    analogWrite(LF_IN1, 0); analogWrite(LF_IN2, abs(speed));
    analogWrite(LB_IN1, 0); analogWrite(LB_IN2, abs(speed));
  } else {
    analogWrite(LF_IN1, 0); analogWrite(LF_IN2, 0);
    analogWrite(LB_IN1, 0); analogWrite(LB_IN2, 0);
  }
}

void setRightMotors(int speed) {
  speed = constrain(speed, -255, 255);
  if (speed > 0) {
    analogWrite(RF_IN3, speed); analogWrite(RF_IN4, 0);
    analogWrite(RB_IN3, speed); analogWrite(RB_IN4, 0);
  } else if (speed < 0) {
    analogWrite(RF_IN3, 0); analogWrite(RF_IN4, abs(speed));
    analogWrite(RB_IN3, 0); analogWrite(RB_IN4, abs(speed));
  } else {
    analogWrite(RF_IN3, 0); analogWrite(RF_IN4, 0);
    analogWrite(RB_IN3, 0); analogWrite(RB_IN4, 0);
  }
}

void stopMotors() {
  setLeftMotors(0);
  setRightMotors(0);
}

void readSensors() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (!isnan(h)) cachedHumidity = h;
  if (!isnan(t)) cachedTemp = t;

  cachedSoilRaw = analogRead(SOIL_PIN);
  int soilPct = map(cachedSoilRaw, SOIL_DRY_RAW, SOIL_WET_RAW, 0, 100);
  cachedSoilPercent = constrain(soilPct, 0, 100);

  cachedMq135Raw = analogRead(MQ135_PIN);
  cachedAirQualityIndex = map(cachedMq135Raw, 0, 4095, 0, 100);
}

void handleSensors() {
  String json = "{";
  json += "\"temp\":" + String(cachedTemp, 1) + ",";
  json += "\"humidity\":" + String(cachedHumidity, 1) + ",";
  json += "\"soil_raw\":" + String(cachedSoilRaw) + ",";
  json += "\"soil_percent\":" + String(cachedSoilPercent) + ",";
  json += "\"mq135_raw\":" + String(cachedMq135Raw) + ",";
  json += "\"air_quality_index\":" + String(cachedAirQualityIndex);
  json += "}";
  server.send(200, "application/json", json);
}

void setup() {
  Serial.begin(115200);

  // ==========================================================
  // v4.1.1 BUG FIX: attach the servo FIRST, before touching any
  // motor pin. analogWrite() (used below for all 8 motor pins)
  // silently claims ESP32 LEDC PWM timers as it's called - if
  // that happens first, the Servo library can be left with no
  // clean timer to allocate. attach() then "succeeds" with no
  // error, but the actual pulse reaching the pin is invalid, so
  // the servo never physically moves even though servoAngle
  // tracks correctly everywhere else (HUD, Serial, etc).
  // Explicitly reserving timer 0 here, before any analogWrite
  // call exists anywhere in setup(), guarantees the servo gets it.
  // ==========================================================
  ESP32PWM::allocateTimer(0);
  panServo.setPeriodHertz(50);
  panServo.attach(SERVO_PIN, 500, 2400);
  panServo.write(90);
  currentServoAngle = 90;

  pinMode(LF_IN1, OUTPUT); pinMode(LF_IN2, OUTPUT);
  pinMode(RF_IN3, OUTPUT); pinMode(RF_IN4, OUTPUT);
  pinMode(LB_IN1, OUTPUT); pinMode(LB_IN2, OUTPUT);
  pinMode(RB_IN3, OUTPUT); pinMode(RB_IN4, OUTPUT);

  stopMotors();  // safe now - servo already has its timer reserved

  dht.begin();
  analogReadResolution(12);

  WiFi.softAP(ssid, password);
  Serial.println("Access Point Started: Smart_Rover_AP");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.softAPIP());

  udp.begin(localUdpPort);

  server.on("/sensors", handleSensors);
  server.begin();
  Serial.println("Sensor HTTP server started on port 80 (/sensors)");
  Serial.println("Servo attached on GPIO13, timer 0 reserved before any motor PWM.");
}

void loop() {
  int packetSize = udp.parsePacket();
  if (packetSize) {
    int len = udp.read(packetBuffer, 255);
    if (len > 0) packetBuffer[len] = 0;

    int leftSpeed = 0, rightSpeed = 0, servoAngle = currentServoAngle;
    int parsed = sscanf(packetBuffer, "%d,%d,%d", &leftSpeed, &rightSpeed, &servoAngle);

    if (parsed >= 2) {
      setLeftMotors(leftSpeed);
      setRightMotors(rightSpeed);
      lastPacketTime = millis();
    }

    if (parsed == 3) {
      servoAngle = constrain(servoAngle, 0, 180);
      if (servoAngle != currentServoAngle) {
        panServo.write(servoAngle);
        currentServoAngle = servoAngle;
      }
    }
  }

  if (millis() - lastPacketTime > 500) {
    stopMotors();
  }

  if (millis() - lastSensorReadTime >= SENSOR_READ_INTERVAL) {
    readSensors();
    lastSensorReadTime = millis();
  }

  server.handleClient();
}
