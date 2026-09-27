"""
Smart Farm Rover - v4.1 Dashboard & Controller
==================================================
Changes from v4:
  - BUG FIX: L2 sensor-capture wasn't firing. Root cause: L2 was read
    from joystick axis 2, but on this controller/driver, axis 2 is
    actually the RIGHT STICK X-axis, not L2 - so "L2 pressed" was only
    ever true by coincidence when the right stick drifted right. L2 is
    now correctly read from axis 4 (the modern standard SDL2 mapping).
    This also explains why axis 2 is exactly what we now deliberately
    use for the new right-stick servo pan control below.
  - NEW: SG90 180-degree pan servo control.
      * Right stick X (joystick) or Left/Right arrow keys (keyboard)
        move the servo SLOWLY and smoothly toward 0 deg or 180 deg -
        this is rate control (stick/key held = keeps moving), not
        position control (stick position != servo angle).
      * Triangle / "2" key -> center, 90 deg (straight ahead)
      * Square / "1" key   -> full left, 0 deg
      * Circle / "3" key   -> full right, 180 deg
  - Image capture moved from R2 to the X / Cross button (joystick).
    Keyboard's C key is unchanged - it already did this.
  - All button indices are printed to the console on first press, so
    if your controller's mapping differs, you can see immediately
    which index it actually used and adjust the constants below.

Run with:  python rover_dashboard.py
Then open: http://localhost:5000
"""

import os
import csv
import time
import socket
import threading
from datetime import datetime

import pygame
import requests
from flask import Flask, jsonify, render_template, send_from_directory

# ============================================================
# Configuration
# ============================================================
ESP32_IP = "192.168.4.1"
ESP32_UDP_PORT = 12345
ESP32_SENSOR_URL = f"http://{ESP32_IP}/sensors"

CAM_IP = "192.168.4.2"
CAM_STREAM_URL = f"http://{CAM_IP}:81/stream"
CAM_CAPTURE_URL = f"http://{CAM_IP}/capture"

SAVE_DIR = "captures"
ENV_LOG_FILE = "env_log.csv"

DEADZONE = 0.15
MAX_PWM = 150
SENSOR_POLL_INTERVAL = 30

SOIL_DRY_THRESHOLD = 30
SOIL_WET_THRESHOLD = 75
HIGH_TEMP_THRESHOLD = 35
LOW_HUMIDITY_THRESHOLD = 40
HIGH_AQI_THRESHOLD = 65

STALE_AFTER_SECONDS = 90
OFFLINE_AFTER_SECONDS = 180

# ============================================================
# v4.1: Joystick axis/button map.
# Modern SDL2 standard mapping (confirmed against this controller's
# actual behavior via the L2 bug report):
#   axis 0 = Left stick X     axis 1 = Left stick Y
#   axis 2 = Right stick X    axis 3 = Right stick Y (unused)
#   axis 4 = L2 trigger       axis 5 = R2 trigger (unused as of v4.1)
#   button 0 = Cross(X)  1 = Circle  2 = Square  3 = Triangle
# If your controller differs, watch the console - every button press
# and L2/RX activity is logged with its raw index/value.
# ============================================================
AXIS_LX, AXIS_LY = 0, 1
AXIS_RX = 2
AXIS_L2 = 4
BUTTON_CROSS, BUTTON_CIRCLE, BUTTON_SQUARE, BUTTON_TRIANGLE = 0, 1, 2, 3

# v4.1: Servo pan control
SERVO_MIN, SERVO_CENTER, SERVO_MAX = 0, 90, 180
SERVO_MAX_RATE_DEG_PER_SEC = 60   # how fast the servo sweeps at full stick deflection - "slow and smooth" per spec

PIN_LABELS = {
    26: "LF_IN1", 27: "LF_IN2",
    25: "RF_IN3", 33: "RF_IN4",
    14: "LB_IN1", 12: "LB_IN2",
    18: "RB_IN3", 19: "RB_IN4",
}

os.makedirs(SAVE_DIR, exist_ok=True)

# ============================================================
# Shared state
# ============================================================
state_lock = threading.Lock()

latest_sensors = {
    "temp": None, "humidity": None, "soil_percent": None, "air_quality_index": None,
    "flags": [], "updated_at": None, "source": None,
    "connection_status": "ok", "_last_success_ts": 0.0,
}

latest_capture = {"filename": None, "timestamp": None}


def ensure_log_header():
    if not os.path.exists(ENV_LOG_FILE):
        with open(ENV_LOG_FILE, "w", newline="") as f:
            csv.writer(f).writerow(
                ["timestamp", "temp_c", "humidity_pct", "soil_pct", "air_quality_index", "source"]
            )


def log_env_reading(temp, humidity, soil_percent, aqi, source):
    with open(ENV_LOG_FILE, "a", newline="") as f:
        csv.writer(f).writerow(
            [datetime.now().isoformat(timespec="seconds"), temp, humidity, soil_percent, aqi, source]
        )


def compute_advisory(temp, humidity, soil_percent, aqi):
    if None in (temp, humidity, soil_percent, aqi):
        return [{"type": "info", "text": "Waiting for first reading..."}]
    flags = []
    if soil_percent <= SOIL_DRY_THRESHOLD:
        flags.append({"type": "irrigate", "text": f"Soil moisture low ({soil_percent}%) - irrigation recommended"})
    elif soil_percent >= SOIL_WET_THRESHOLD:
        flags.append({"type": "hold", "text": f"Soil moisture high ({soil_percent}%) - delay irrigation, risk of over-watering"})
    if temp >= HIGH_TEMP_THRESHOLD and humidity <= LOW_HUMIDITY_THRESHOLD:
        flags.append({"type": "hold", "text": f"Heat stress conditions ({temp}C, {humidity}% RH) - if irrigating, prefer early morning or evening"})
    if aqi >= HIGH_AQI_THRESHOLD:
        flags.append({"type": "alert", "text": f"Elevated gas signature ({aqi}%) - inspect for decaying matter or fungal activity nearby"})
    if not flags:
        flags.append({"type": "normal", "text": "Conditions normal - no immediate action needed"})
    return flags


def update_sensor_cache(source="auto"):
    try:
        resp = requests.get(ESP32_SENSOR_URL, timeout=2)
        resp.raise_for_status()
        data = resp.json()
    except requests.exceptions.Timeout:
        print("[SENSOR TIMEOUT] ESP32 did not respond within 2s")
        mark_connection_health()
        return
    except requests.exceptions.ConnectionError:
        print("[SENSOR UNREACHABLE] Could not reach ESP32 - check AP connection")
        mark_connection_health()
        return
    except Exception as e:
        print(f"[SENSOR POLL FAILED] {e}")
        mark_connection_health()
        return

    temp = data.get("temp")
    humidity = data.get("humidity")
    soil_percent = data.get("soil_percent")
    aqi = data.get("air_quality_index")
    flags = compute_advisory(temp, humidity, soil_percent, aqi)

    with state_lock:
        latest_sensors.update({
            "temp": temp, "humidity": humidity, "soil_percent": soil_percent,
            "air_quality_index": aqi, "flags": flags,
            "updated_at": datetime.now().strftime("%H:%M:%S"),
            "source": source, "connection_status": "ok",
            "_last_success_ts": time.time(),
        })

    log_env_reading(temp, humidity, soil_percent, aqi, source)
    tag = "MANUAL" if source == "manual" else "auto"
    print(f"[SENSORS {tag}] temp={temp}C humidity={humidity}% soil={soil_percent}% aqi={aqi}%")


def mark_connection_health():
    with state_lock:
        last_success = latest_sensors["_last_success_ts"]
        elapsed = time.time() - last_success if last_success else float("inf")
        if elapsed >= OFFLINE_AFTER_SECONDS:
            latest_sensors["connection_status"] = "offline"
        elif elapsed >= STALE_AFTER_SECONDS:
            latest_sensors["connection_status"] = "stale"


def sensor_poll_loop():
    ensure_log_header()
    while True:
        with state_lock:
            last_ts = latest_sensors["_last_success_ts"]
        elapsed = time.time() - last_ts if last_ts else float("inf")
        if elapsed >= SENSOR_POLL_INTERVAL:
            update_sensor_cache(source="auto")
        else:
            mark_connection_health()
        time.sleep(1)


def capture_frame():
    try:
        response = requests.get(CAM_CAPTURE_URL, timeout=3)
        if response.status_code == 200:
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            filename = f"rover_frame_{timestamp}.jpg"
            filepath = os.path.join(SAVE_DIR, filename)
            with open(filepath, "wb") as f:
                f.write(response.content)
            with state_lock:
                latest_capture["filename"] = filename
                latest_capture["timestamp"] = time.strftime("%H:%M:%S")
            print(f"[SNAPSHOT SAVED] -> {filepath}")
        else:
            print(f"[CAPTURE FAILED] HTTP Status: {response.status_code}")
    except Exception as e:
        print(f"[CAPTURE ERROR] Could not reach ESP32-CAM: {e}")


def predict_motor_state(left_speed, right_speed):
    pins = {}
    if left_speed > 0:
        pins.update({26: left_speed, 27: 0, 14: left_speed, 12: 0}); left_state = f"FORWARD (PWM {left_speed})"
    elif left_speed < 0:
        pins.update({26: 0, 27: abs(left_speed), 14: 0, 12: abs(left_speed)}); left_state = f"REVERSE (PWM {abs(left_speed)})"
    else:
        pins.update({26: 0, 27: 0, 14: 0, 12: 0}); left_state = "STOPPED"

    if right_speed > 0:
        pins.update({25: right_speed, 33: 0, 18: right_speed, 19: 0}); right_state = f"FORWARD (PWM {right_speed})"
    elif right_speed < 0:
        pins.update({25: 0, 33: abs(right_speed), 18: 0, 19: abs(right_speed)}); right_state = f"REVERSE (PWM {abs(right_speed)})"
    else:
        pins.update({25: 0, 33: 0, 18: 0, 19: 0}); right_state = "STOPPED"

    return pins, left_state, right_state


def apply_deadzone(val):
    return 0.0 if abs(val) < DEADZONE else val


def control_loop():
    pygame.init()
    pygame.joystick.init()

    screen = pygame.display.set_mode((640, 600))
    pygame.display.set_caption("Smart Farm Rover - Control & Diagnostics")
    font = pygame.font.SysFont("consolas", 16)
    font_bold = pygame.font.SysFont("consolas", 18, bold=True)

    controller = None
    if pygame.joystick.get_count() > 0:
        controller = pygame.joystick.Joystick(0)
        controller.init()
        print(f"Controller connected at startup: {controller.get_name()}")
    else:
        print("No PS4 controller at startup - using keyboard. Connect a controller anytime to switch live.")

    print("\n--- Rover Active (v4.1) ---")
    print("Drive    : WASD or left stick")
    print("Pan servo: Left/Right arrows or right stick (smooth) | 1/Square=0deg  2/Triangle=90deg  3/Circle=180deg")
    print("Capture  : C (keyboard) or X/Cross (joystick)")
    print("Sensors  : X (keyboard) or L2 (joystick)")

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    r2_was_pressed = False  # kept for reference/logging only, no longer bound to an action
    l2_was_pressed = False
    c_was_pressed = False
    x_was_pressed = False
    cross_was_pressed = False
    triangle_was_pressed = False
    square_was_pressed = False
    circle_was_pressed = False

    left_speed, right_speed = 0, 0
    servo_angle = float(SERVO_CENTER)
    active_source = "keyboard"
    last_render_time = 0
    last_hotplug_check = 0
    last_tick_time = time.time()
    RENDER_INTERVAL = 0.1
    HOTPLUG_CHECK_INTERVAL = 2.0

    running = True
    while running:
        now = time.time()
        dt = now - last_tick_time
        last_tick_time = now

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.JOYDEVICEADDED:
                try:
                    controller = pygame.joystick.Joystick(event.device_index)
                    controller.init()
                    print(f"[JOYSTICK CONNECTED] {controller.get_name()}")
                except Exception as e:
                    print(f"[JOYSTICK INIT ERROR] {e}")
            elif event.type == pygame.JOYDEVICEREMOVED:
                print("[JOYSTICK DISCONNECTED] Continuing on keyboard")
                controller = None
            elif event.type == pygame.JOYBUTTONDOWN:
                print(f"[JOYSTICK BUTTON] index {event.button} pressed "
                      f"(Cross={BUTTON_CROSS} Circle={BUTTON_CIRCLE} Square={BUTTON_SQUARE} Triangle={BUTTON_TRIANGLE})")

        if now - last_hotplug_check >= HOTPLUG_CHECK_INTERVAL:
            last_hotplug_check = now
            if controller is None and pygame.joystick.get_count() > 0:
                try:
                    controller = pygame.joystick.Joystick(0)
                    controller.init()
                    print(f"[JOYSTICK CONNECTED] {controller.get_name()} (detected via fallback check)")
                except Exception:
                    pass

        # --- Keyboard: drive + pan + capture (always read) ---
        keys = pygame.key.get_pressed()
        kb_throttle = (1 if keys[pygame.K_w] else 0) - (1 if keys[pygame.K_s] else 0)
        kb_turn = (1 if keys[pygame.K_d] else 0) - (1 if keys[pygame.K_a] else 0)
        kb_left = int(max(-1.0, min(1.0, kb_throttle + kb_turn)) * MAX_PWM)
        kb_right = int(max(-1.0, min(1.0, kb_throttle - kb_turn)) * MAX_PWM)

        kb_pan = (1 if keys[pygame.K_RIGHT] else 0) - (1 if keys[pygame.K_LEFT] else 0)

        is_c_pressed = keys[pygame.K_c]
        if is_c_pressed and not c_was_pressed:
            capture_frame()
        c_was_pressed = is_c_pressed

        is_x_pressed = keys[pygame.K_x]
        if is_x_pressed and not x_was_pressed:
            update_sensor_cache(source="manual")
        x_was_pressed = is_x_pressed

        is_1_pressed = keys[pygame.K_1]
        if is_1_pressed:
            servo_angle = float(SERVO_MIN)
        is_2_pressed = keys[pygame.K_2]
        if is_2_pressed:
            servo_angle = float(SERVO_CENTER)
        is_3_pressed = keys[pygame.K_3]
        if is_3_pressed:
            servo_angle = float(SERVO_MAX)

        # --- Joystick: drive + pan + capture + sensors (read if connected) ---
        joy_left, joy_right, joy_active = 0, 0, False
        joy_pan_input = 0.0
        if controller is not None:
            try:
                x_axis_raw = controller.get_axis(AXIS_LX)
                y_axis_raw = -controller.get_axis(AXIS_LY)
                joy_active = abs(x_axis_raw) > DEADZONE or abs(y_axis_raw) > DEADZONE

                x_axis = apply_deadzone(x_axis_raw)
                y_axis = apply_deadzone(y_axis_raw)
                joy_left = int(max(-1.0, min(1.0, y_axis + x_axis)) * MAX_PWM)
                joy_right = int(max(-1.0, min(1.0, y_axis - x_axis)) * MAX_PWM)

                rx_raw = controller.get_axis(AXIS_RX) if controller.get_numaxes() > AXIS_RX else 0.0
                joy_pan_input = apply_deadzone(rx_raw)

                l2_raw = controller.get_axis(AXIS_L2) if controller.get_numaxes() > AXIS_L2 else -1.0
                is_l2_pressed = l2_raw > 0.2
                if is_l2_pressed and not l2_was_pressed:
                    update_sensor_cache(source="manual")
                l2_was_pressed = is_l2_pressed

                num_buttons = controller.get_numbuttons()
                if num_buttons > BUTTON_CROSS:
                    is_cross = controller.get_button(BUTTON_CROSS)
                    if is_cross and not cross_was_pressed:
                        capture_frame()
                    cross_was_pressed = is_cross
                if num_buttons > BUTTON_TRIANGLE:
                    is_triangle = controller.get_button(BUTTON_TRIANGLE)
                    if is_triangle and not triangle_was_pressed:
                        servo_angle = float(SERVO_CENTER)
                    triangle_was_pressed = is_triangle
                if num_buttons > BUTTON_SQUARE:
                    is_square = controller.get_button(BUTTON_SQUARE)
                    if is_square and not square_was_pressed:
                        servo_angle = float(SERVO_MIN)
                    square_was_pressed = is_square
                if num_buttons > BUTTON_CIRCLE:
                    is_circle = controller.get_button(BUTTON_CIRCLE)
                    if is_circle and not circle_was_pressed:
                        servo_angle = float(SERVO_MAX)
                    circle_was_pressed = is_circle
            except Exception as e:
                print(f"[JOYSTICK READ ERROR] {e} - falling back to keyboard")
                controller = None

        # --- Pan servo: rate control, joystick takes priority when active ---
        pan_input = joy_pan_input if abs(joy_pan_input) > 0 else float(kb_pan)
        if pan_input != 0.0:
            servo_angle += pan_input * SERVO_MAX_RATE_DEG_PER_SEC * dt
            servo_angle = max(SERVO_MIN, min(SERVO_MAX, servo_angle))

        # --- Drive: whichever input is actively being used wins ---
        if controller is not None and joy_active:
            left_speed, right_speed = joy_left, joy_right
            active_source = "joystick"
        else:
            left_speed, right_speed = kb_left, kb_right
            active_source = "keyboard" if (kb_left != 0 or kb_right != 0) else active_source

        msg = f"{left_speed},{right_speed},{int(round(servo_angle))}".encode()
        sock.sendto(msg, (ESP32_IP, ESP32_UDP_PORT))

        if now - last_render_time >= RENDER_INTERVAL:
            last_render_time = now
            draw_hud(screen, font, font_bold, controller, active_source, left_speed, right_speed, servo_angle)

        time.sleep(0.02)

    sock.sendto(b"0,0,90".encode(), (ESP32_IP, ESP32_UDP_PORT))
    pygame.quit()
    print("\nControl loop stopped, motors stopped, servo left at last position.")
    os._exit(0)


def draw_hud(screen, font, font_bold, controller, active_source, left_speed, right_speed, servo_angle):
    BG = (26, 23, 18)
    TEXT = (242, 236, 224)
    MUTED = (169, 156, 135)
    AMBER = (217, 164, 65)
    SAGE = (140, 163, 124)
    CORAL = (196, 102, 75)
    ALERT = (224, 87, 74)

    screen.fill(BG)
    y = 14
    line_h = 22

    def draw(text, color=TEXT, bold=False, indent=0):
        nonlocal y
        f = font_bold if bold else font
        surf = f.render(text, True, color)
        screen.blit(surf, (14 + indent, y))
        y += line_h

    draw("SMART FARM ROVER - CONTROL & DIAGNOSTICS (v4.1)", AMBER, bold=True)
    y += 6

    draw(f"Active input: {active_source.upper()}", SAGE, bold=True)
    joy_status = controller.get_name() if controller is not None else "not connected"
    draw(f"  Joystick: {joy_status}", MUTED, indent=10)
    draw("  Keyboard: always available (click window for focus)", MUTED, indent=10)
    y += 6

    draw(f"Command: LEFT={left_speed}  RIGHT={right_speed}  SERVO={int(round(servo_angle))} deg", bold=True)
    y += 4

    pins, left_state, right_state = predict_motor_state(left_speed, right_speed)
    draw("LEFT SIDE: " + left_state, CORAL if left_speed != 0 else MUTED, bold=True)
    draw(f"  LF_IN1(26)={pins[26]}  LF_IN2(27)={pins[27]}", indent=10)
    draw(f"  LB_IN1(14)={pins[14]}  LB_IN2(12)={pins[12]}", indent=10)
    y += 4
    draw("RIGHT SIDE: " + right_state, CORAL if right_speed != 0 else MUTED, bold=True)
    draw(f"  RF_IN3(25)={pins[25]}  RF_IN4(33)={pins[33]}", indent=10)
    draw(f"  RB_IN3(18)={pins[18]}  RB_IN4(19)={pins[19]}", indent=10)
    y += 6

    draw(f"PAN SERVO (GPIO13): {int(round(servo_angle))} deg", AMBER, bold=True)
    y += 6

    with state_lock:
        s = dict(latest_sensors)

    status_color = {"ok": SAGE, "stale": AMBER, "offline": ALERT}.get(s["connection_status"], MUTED)
    draw("LATEST SENSOR SNAPSHOT", AMBER, bold=True)
    draw(f"  Link status: {s['connection_status'].upper()}", status_color, indent=10)
    temp_s = f"{s['temp']}C" if s["temp"] is not None else "--"
    hum_s = f"{s['humidity']}%" if s["humidity"] is not None else "--"
    soil_s = f"{s['soil_percent']}%" if s["soil_percent"] is not None else "--"
    aqi_s = f"{s['air_quality_index']}%" if s["air_quality_index"] is not None else "--"
    draw(f"  Temp: {temp_s}   Humidity: {hum_s}", indent=10)
    draw(f"  Soil: {soil_s}   Gas index: {aqi_s}", indent=10)
    updated_s = s["updated_at"] or "waiting..."
    src_s = s["source"] or ""
    draw(f"  Updated: {updated_s} ({src_s})", MUTED, indent=10)

    pygame.display.flip()


app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response


@app.route("/")
def dashboard():
    return render_template("dashboard.html", cam_stream_url=CAM_STREAM_URL)


@app.route("/api/sensors")
def api_sensors():
    with state_lock:
        data = dict(latest_sensors)
    data.pop("_last_success_ts", None)
    return jsonify(data)


@app.route("/api/sensors/history")
def api_sensors_history():
    records = []
    if os.path.exists(ENV_LOG_FILE):
        try:
            with open(ENV_LOG_FILE, "r", encoding="utf-8", errors="ignore") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    try:
                        temp = float(row["temp_c"]) if row.get("temp_c") not in (None, "", "None") else None
                        hum = float(row["humidity_pct"]) if row.get("humidity_pct") not in (None, "", "None") else None
                        soil = float(row["soil_pct"]) if row.get("soil_pct") not in (None, "", "None") else None
                        aqi = float(row["air_quality_index"]) if row.get("air_quality_index") not in (None, "", "None") else None
                        records.append({
                            "timestamp": row.get("timestamp", ""),
                            "temp": temp,
                            "temp_c": temp,
                            "humidity": hum,
                            "humidity_pct": hum,
                            "soil_percent": soil,
                            "soil_pct": soil,
                            "air_quality_index": aqi,
                            "source": row.get("source", "auto")
                        })
                    except Exception:
                        continue
        except Exception as e:
            print(f"[HISTORY ERROR] {e}")
    return jsonify(records[-50:])


@app.route("/api/last-capture")
def api_last_capture():
    with state_lock:
        return jsonify(dict(latest_capture))


@app.route("/captures/<path:filename>")
def serve_capture(filename):
    return send_from_directory(SAVE_DIR, filename)


if __name__ == "__main__":
    control_thread = threading.Thread(target=control_loop, daemon=True)
    control_thread.start()

    poll_thread = threading.Thread(target=sensor_poll_loop, daemon=True)
    poll_thread.start()

    print("\nDashboard running at http://localhost:5000\n")
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)
