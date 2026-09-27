# SPROUT Smart Farm Rover — Hardware Camera Integration Guide

This document details the hardware architecture, stream protocol, network requirements, and integration setup for connecting the physical ESP32-CAM camera feed to the SPROUT React Dashboard.

---

## 1. System Architecture

```
                       ┌─────────────────────────────────────┐
                       │        ESP32-CAM Board              │
                       │    (IP: 192.168.4.2:81/stream)       │
                       └──────────────────┬──────────────────┘
                                          │
                               MJPEG Stream over HTTP
                                          │
                                          ▼
┌──────────────────────┐        ┌───────────────────┐        ┌────────────────────────┐
│  ESP32 Main Board    │        │ Laptop Wi-Fi AP   │        │ React Web Dashboard    │
│  (192.168.4.1)       │◄──────►│ "Smart_Rover_AP"  │◄──────►│ (SPROUT Frontend)      │
│  UDP 12345 (Motors)  │  UDP   │ Password:         │  HTTP  │ [ Prototype | Live ]   │
│  HTTP 80 (/sensors)  │        │ p12345678         │        └────────────────────────┘
└──────────▲───────────┘        └─────────▲─────────┘
           │                              │
           └──────────────┬───────────────┘
                          │ HTTP / UDP
                          ▼
              ┌───────────────────────┐
              │ rover_dashboard.py    │
              │ (Flask + Pygame HUD)  │
              └───────────────────────┘
```

---

## 2. Hardware Component Overview

1. **ESP32 Main MCU Board (`rover_firmware_v4_1.ino`)**:
   - Creates Wi-Fi Access Point: `Smart_Rover_AP` (IP `192.168.4.1`, Password `p12345678`).
   - Accepts UDP motor PWM control packets on port `12345` (Left speed, Right speed, Pan Servo Angle).
   - Serves environmental telemetry over HTTP GET at `http://192.168.4.1/sensors` (DHT11 temp/humidity, Soil moisture, MQ135 Air Quality).

2. **ESP32-CAM Camera Module**:
   - Connects to `Smart_Rover_AP` at static IP `192.168.4.2`.
   - Serves live continuous video stream as an HTTP MJPEG stream at:
     ```
     http://192.168.4.2:81/stream
     ```
   - Serves single JPEG frame snapshots at:
     ```
     http://192.168.4.2/capture
     ```

3. **Python Bridge & Controller (`Hardware/rover_dashboard.py`)**:
   - Reads PS4 controller / keyboard input via Pygame.
   - Transmits UDP movement and SG90 servo pan packets to `192.168.4.1:12345`.
   - Polls `/sensors` and hosts Flask telemetry endpoints on `http://localhost:5000/api/sensors`.
   - Saves captured snapshot frames locally to `Hardware/captures/`.

4. **React Frontend (`src/pages/LiveRoverPage.jsx`)**:
   - Displays Live Rover card with dual-mode switch: **Prototype View** and **Live Rover**.
   - Directly renders the ESP32-CAM MJPEG HTTP stream via standard `<img>` tag without protocol translation.

---

## 3. Network & Connection Requirements

- **Wi-Fi SSID**: `Smart_Rover_AP`
- **Wi-Fi Password**: `p12345678`
- **Subnet / IP Range**: `192.168.4.x`
- **Ports**:
  - `81` (ESP32-CAM MJPEG Stream)
  - `80` (ESP32-CAM Snapshot & ESP32 Sensors)
  - `12345` (ESP32 Motor/Servo UDP Socket)
  - `5000` (Python Flask Dashboard API)

---

## 4. Environment Configuration

The React dashboard configures the camera stream URL via environment variables.

File: `.env` (or `.env.local`):
```env
# ESP32-CAM Live MJPEG Stream URL
VITE_ROVER_CAMERA_URL=http://192.168.4.2:81/stream

# Python Dashboard Bridge API
VITE_ROVER_API_URL=http://localhost:5000
```

Centralized config reference: `src/config/roverConfig.js`.

---

## 5. Startup Commands

### Step 1: Power Rover Hardware
1. Connect battery to ESP32 main board and ESP32-CAM module.
2. Confirm Wi-Fi Access Point `Smart_Rover_AP` is visible.

### Step 2: Connect Laptop to Rover Wi-Fi
Connect your computer's Wi-Fi interface to `Smart_Rover_AP` using password `p12345678`.

### Step 3: Launch Python Hardware Bridge & Controller
```bash
cd Hardware
python rover_dashboard.py
```
*This opens the Pygame HUD diagnostic window and starts the Flask API at `http://localhost:5000`.*

### Step 4: Launch React Dashboard
In a separate terminal window:
```bash
npm run dev
```
Open `http://localhost:5173` (or Vite dev server URL) and navigate to **Live Rover**.

---

## 6. How to Switch Modes

Inside the **Live Rover Feed** card header, click the segmented mode toggle:

- **[ Prototype ]**: Loads presentation optics with mock bounding boxes and simulation overlay. Recommended for pitch presentations or offline demonstrations.
- **[ Live Rover ]**: Connects directly to `http://192.168.4.2:81/stream` to render the actual hardware feed.

---

## 7. Offline Fallback & Retry Behavior

When **Live Rover** mode is selected and the ESP32-CAM stream is unreachable (e.g. rover powered off or Wi-Fi disconnected):
- The dashboard automatically shows a **CAMERA OFFLINE** state with connection diagnostics.
- Clicking **[ Retry Connection ]** appends a cache-busting timestamp to re-attempt establishing the stream.
- The dashboard never crashes or freezes when hardware is offline.
