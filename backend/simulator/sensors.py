from datetime import datetime
import random


# ============================================================
# SMART FARM ROVER - SENSOR SIMULATOR
# ============================================================

def get_sensor_data():
    """
    Generate one complete sensor reading.

    This is temporary simulated data.
    Later this function will read actual rover sensors.
    """

    temperature = round(random.uniform(24.0, 34.0), 1)
    humidity = round(random.uniform(45.0, 80.0), 1)
    soil_moisture = round(random.uniform(25.0, 75.0), 1)

    # --------------------------------------------------------
    # Derived values
    # --------------------------------------------------------

    if soil_moisture < 30:
        soil_status = "Dry"
    elif soil_moisture < 60:
        soil_status = "Optimal"
    else:
        soil_status = "Wet"

    if temperature > 35:
        temperature_status = "High"
    elif temperature < 15:
        temperature_status = "Low"
    else:
        temperature_status = "Normal"

    return {
        "temperature": temperature,
        "humidity": humidity,
        "soil_moisture": soil_moisture,
        "soil_status": soil_status,
        "temperature_status": temperature_status,
        "timestamp": datetime.now().isoformat()
    }


# ============================================================
# ROVER STATUS
# ============================================================

def get_rover_status():
    """
    Return the current simulated rover status.

    This function is kept separate because the backend
    may use it for the rover status endpoint.
    """

    sensor_data = get_sensor_data()

    return {
        "rover_status": "online",
        "sensor_status": "simulated",
        "sensors": sensor_data,
        "timestamp": sensor_data["timestamp"]
    }


# ============================================================
# INDIVIDUAL SENSOR FUNCTIONS
# ============================================================

def get_temperature():
    return get_sensor_data()["temperature"]


def get_humidity():
    return get_sensor_data()["humidity"]


def get_soil_moisture():
    return get_sensor_data()["soil_moisture"]


# ============================================================
# MANUAL TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print("SMART FARM ROVER - SENSOR SIMULATOR")
    print("=" * 70)

    print("\nSENSOR DATA")
    print("-" * 70)

    data = get_sensor_data()

    print("Temperature       :", data["temperature"], "°C")
    print("Humidity          :", data["humidity"], "%")
    print("Soil Moisture     :", data["soil_moisture"], "%")
    print("Soil Status       :", data["soil_status"])
    print("Temperature State :", data["temperature_status"])
    print("Timestamp         :", data["timestamp"])

    print("\nROVER STATUS")
    print("-" * 70)

    rover = get_rover_status()

    print("Rover             :", rover["rover_status"])
    print("Sensor Mode       :", rover["sensor_status"])

    print("\n" + "=" * 70)