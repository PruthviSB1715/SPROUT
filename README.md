# 🌱 SPROUT
### Smart Farming Assistant — Field-Deployable AI Rover

**SPROUT** is an AI-powered smart farming assistant designed to support early crop disease detection, environmental monitoring, and climate-resilient agriculture. It combines a mobile rover, computer vision, machine learning, environmental sensors, and a farmer-facing web application to assist with crop health monitoring.

> **Project:** Smart Farming Assistant for Early Crop Protection and Climate-Resilient Agriculture  
> **Domain:** Artificial Intelligence · Machine Learning · Robotics · Smart Agriculture · IoT  
> **Platform:** Mobile rover + Web application + ML inference

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Software Architecture](#-software-architecture)
- [Machine Learning Pipeline](#-machine-learning-pipeline)
- [Hardware Architecture](#-hardware-architecture)
- [Operating Modes](#-operating-modes)
- [Data Flow](#-data-flow)
- [Repository Structure](#-repository-structure)
- [Installation and Setup](#-installation-and-setup)
- [Running the Application](#-running-the-application)
- [Model Information](#-model-information)
- [Offline Operation](#-offline-operation)
- [Current Limitations](#-current-limitations)
- [Future Scope](#-future-scope)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌾 Overview

Agriculture is increasingly affected by crop diseases, pests, irregular rainfall, drought, heat waves, and inefficient resource utilization. Identifying crop health problems early can help farmers respond before damage spreads.

SPROUT is a field-deployable smart farming assistant that integrates a mobile rover with AI-based crop image analysis and environmental monitoring. Its software combines a web interface, machine learning models, and backend services to process crop images and present useful information.

The system is designed around three major components:

1. **Intelligent rover:** A mobile platform equipped with a camera and environmental sensing capabilities for field observation.
2. **AI-powered software:** Machine learning-based crop disease classification, image processing, backend services, and a web dashboard.
3. **Farmer-centric interaction:** An interface for viewing observations, uploading crop images, and accessing crop health information.

The project aims to progressively integrate autonomous field scouting, AI-assisted decision-making, and offline-capable intelligence into one platform.

## 🎯 Problem Statement

Traditional crop monitoring often depends on manual field inspections and visual identification of diseases. These methods can be time-consuming and may delay the identification of crop health problems.

Key challenges include:

- Delayed identification of visible crop diseases.
- Labor-intensive and repetitive field scouting.
- Limited access to timely crop health information.
- Environmental conditions that can affect crop growth.
- Connectivity constraints in agricultural areas.
- Difficulty monitoring multiple plants and field locations regularly.

SPROUT addresses these challenges through a combination of mobile field observation, image-based disease classification, environmental monitoring, and a centralized software interface.

## 💡 Our Solution

SPROUT combines a mobile agricultural rover with a computer-vision-based crop analysis system.

The rover provides a mobile platform for field observation. Its camera captures crop images, while environmental sensors collect available environmental readings. The software processes crop images through trained machine learning models and presents predictions through a web interface.

The architecture is modular, allowing the machine learning, backend, frontend, and hardware components to be developed and improved independently.

### Core workflow

1. **Field observation:** The rover is operated in the field to observe crops.
2. **Image acquisition:** The camera captures images of plant leaves and other visible crop features.
3. **Image analysis:** The software preprocesses the image and sends it to the applicable ML model.
4. **Disease classification:** The model predicts a supported crop health class.
5. **Environmental monitoring:** Available sensors provide environmental readings.
6. **Information presentation:** The web application displays predictions and available environmental data.
7. **Human intervention:** Farmers or operators review the results and decide on appropriate action.

AI predictions are intended to support field observations, not replace expert agricultural diagnosis.

## ✨ Key Features

### 🤖 AI-Based Crop Disease Detection
- Image-based crop disease classification using deep learning.
- Supports the crop and disease classes represented in the deployed model.
- Image upload and prediction through the software interface.
- Modular architecture for adding additional crop models.

### 🌿 Crop Classification
- Supports crop-specific classification workflows.
- Separates model training and inference components.
- Provides a foundation for expanding to additional crop varieties and disease classes.

### 🚜 Mobile Rover Platform
- Mobile platform designed for agricultural field observation.
- Camera mounted on a servo mechanism for adjustable viewing angles.
- Firmware-based hardware control.
- Designed to support future autonomous field scouting.

### 🌡️ Environmental Monitoring
- Temperature and humidity monitoring using available sensors.
- Environmental readings can be displayed through the dashboard.
- Architecture designed to accommodate additional sensors, including soil-moisture sensing.

### 📊 Farmer-Facing Dashboard
- Web-based user interface for crop analysis.
- Image upload and disease prediction workflow.
- Environmental information display.
- Integration point for rover observations and future monitoring features.

### 📡 Offline-Oriented Architecture
- Designed to support edge and offline-capable intelligence.
- Local model inference can reduce dependence on external AI services.
- Connectivity-dependent features are separated from local processing wherever possible.

---

## 🏗️ System Architecture

SPROUT is divided into four major layers.

| Layer | Responsibilities | Technologies |
|---|---|---|
| Frontend | User interface, image upload, results and dashboard | React, Vite, JavaScript, Tailwind CSS |
| Backend | Application logic, APIs and model integration | Python, existing backend services |
| AI/ML | Image preprocessing, training, inference and classification | TensorFlow/Keras, Python |
| Hardware | Rover control, camera positioning and environmental sensing | Arduino-compatible firmware, sensors and servo |

### High-level architecture

```text
                 SPROUT
                    |
       +------------+------------+
       |                         |
   HARDWARE                    SOFTWARE
       |                         |
   Mobile Rover              Web Application
       |                         |
   +---+---------+           Frontend
   |             |              |
 Camera      Sensors         Backend APIs
   |             |              |
 Crop Images  Environmental     |
   |          Readings          |
   +-------------+--------------+
                 |
           Data Processing
                 |
          Machine Learning
                 |
       Crop Health Prediction
                 |
          Results Dashboard
                 |
        Farmer / Operator
```

The hardware and software are modular. Their degree of integration depends on the deployed firmware, communication interface, and backend configuration.

---

## 💻 Software Architecture

The software is organized into frontend, backend, and machine learning components.

### 1. Frontend

The frontend is a web application developed using React and Vite.

**Responsibilities:**
- Present the SPROUT user interface.
- Allow users to upload crop images.
- Display machine learning prediction results.
- Show available environmental readings.
- Provide the interface for future rover monitoring and control integrations.

**Technology stack:**
- React
- Vite
- JavaScript
- Tailwind CSS
- npm

The frontend communicates with backend services through the configured application interfaces.

### 2. Backend

The backend is responsible for coordinating application-level operations and connecting the frontend with the machine learning functionality.

**Responsibilities:**
- Handle application requests.
- Receive and process crop image submissions.
- Connect the prediction workflow with the ML inference code.
- Return prediction results to the frontend.
- Support future integration with rover telemetry and sensor data.

**Technology:** Python-based backend services and supporting libraries used in the project.

The exact API routes and execution commands should be documented alongside the backend implementation.

### 3. Machine Learning

The ML component provides the crop image analysis functionality.

**Responsibilities:**
- Dataset preparation and preprocessing.
- Model training and evaluation.
- Image preprocessing for inference.
- Crop disease classification.
- Prediction output for the application.

**Technology stack:**
- Python
- TensorFlow
- Keras
- NumPy
- OpenCV, where used by the image-processing pipeline

The training and inference code is kept separate from the user interface to allow independent model improvements.

---

## 🧠 Machine Learning Pipeline

The SPROUT ML pipeline converts crop images into classification results.

### Training workflow

```text
Crop Image Dataset
        |
        v
Data Cleaning and Validation
        |
        v
Image Preprocessing
        |
        v
Train / Validation / Test Split
        |
        v
Model Training
        |
        v
Model Evaluation
        |
        v
Model Saving
        |
        v
Inference Integration
```

### Image preprocessing

The preprocessing stage prepares input images for model inference. Depending on the model, this may include:

- Image resizing to the required input dimensions.
- Pixel normalization.
- Channel and tensor formatting.
- Validation of input image compatibility.

The inference preprocessing must match the preprocessing used during training.

### Model inference

1. The application receives a crop image.
2. The backend validates and preprocesses the image.
3. The appropriate trained model generates class scores.
4. The output is mapped to the model's supported class labels.
5. The prediction is returned to the application for display.

The model's output is a classification result, not a definitive agricultural diagnosis.

### Supported model experiments

The project includes a tomato disease classification prototype and preparation work for multicrop classification.

The tomato prototype uses three classes:

- Healthy
- Early blight
- Late blight

The reported test accuracy of the tomato prototype is **96.89%** under its original evaluation setup. This is an experimental result and should not be interpreted as a guaranteed real-world field accuracy.

Multicrop preparation has included Apple, Corn, Grape, Bell Pepper, Potato, and Tomato classes. The exact supported classes depend on the model selected for deployment.

---

## 🚜 Hardware Architecture

The hardware component consists of a mobile rover platform and its sensing and control components.

### 1. Mobile Rover

The rover is designed to move through agricultural environments and assist with crop observation.

Its intended responsibilities include:

- Navigating suitable field paths.
- Carrying the camera and environmental sensors.
- Supporting repeated crop observations.
- Providing a mobile platform for future autonomous scouting.

The rover's operating performance depends on field conditions, crop spacing, traction, and the installed hardware.

### 2. Camera and Servo Mechanism

A camera mounted on a servo mechanism provides adjustable viewing angles.

**Purpose:**
- Capture crop images from different orientations.
- Adjust the camera's viewing direction.
- Assist the operator in observing plants.
- Support the future development of automated image capture.

The servo-driven camera can change its orientation, but this alone does not provide complete 360-degree field coverage.

### 3. Environmental Sensors

The current prototype includes temperature and humidity sensing.

| Sensor | Parameter | Status |
|---|---|---|
| Temperature sensor | Ambient temperature | Available |
| Humidity sensor | Relative humidity | Available |
| Soil-moisture sensor | Soil moisture | Planned |

Sensor availability and readings depend on the physical hardware connected to the rover.

### 4. Firmware

The rover firmware is implemented in Arduino-compatible C/C++.

Its role includes:
- Hardware control.
- Servo positioning.
- Sensor interfacing.
- Rover operation according to the implemented firmware logic.

Firmware capabilities depend on the specific version installed on the rover.

### 5. Detachable SensePod — Planned Extension

A detachable SensePod is a proposed extension to enable manual crop scanning independently of the rover.

Its intended purpose is to provide a portable crop observation unit for locations that the rover cannot easily reach, including areas with narrow crop spacing or difficult access.

This is a planned extension and should not be considered a completed hardware feature unless it has been physically implemented.

---

## 🎮 Operating Modes

The intended SPROUT operating concept includes three modes.

| Mode | Description |
|---|---|
| Automatic | Autonomous field scouting and observation along supported routes. |
| Semi-Automatic | AI-assisted operation with the operator involved in selecting targets or actions. |
| Manual | Direct operator control of the rover and its observation functions. |

The availability of these modes depends on the currently deployed firmware and hardware. They represent the system's intended operating architecture, not a claim that every mode is fully implemented.

---

## 🔄 Data Flow

The main software workflow is as follows:

1. A user or camera provides a crop image.
2. The frontend submits the image through the configured backend interface.
3. The backend validates the image and prepares it for inference.
4. The ML model processes the image and produces a classification.
5. The backend returns the prediction to the frontend.
6. The frontend presents the result to the user.

Environmental data follows a separate sensing and display workflow:

1. The available sensors collect readings.
2. The rover's firmware makes the readings available through the implemented logging or communication mechanism.
3. The software reads available environmental data.
4. The dashboard presents the readings.

The exact transport mechanism between the rover and backend depends on the deployed integration.

---

## 📁 Repository Structure

```text
SPROUT/
│
├── backend/
│   ├── backend/             # Backend service code
│   ├── src/                 # Supporting application modules
│   ├── simulator/           # Rover simulation components
│   └── ...
│
├── ml/
│   ├── models/              # Trained model artifacts
│   ├── evaluation/          # Model evaluation
│   └── ...
│
├── frontend/
│   ├── src/                 # React application source
│   ├── public/              # Static assets
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── hardware/
│   └── Hardware/            # Rover firmware and hardware files
│
├── docs/                    # Project documentation
│
├── .gitignore
└── README.md
```

*The directory listing above is representative. Actual subdirectories may differ as the repository evolves.*

---

## ⚙️ Installation and Setup

### Prerequisites

Install the following tools before setting up the project:

- Git
- Python 3.x compatible with the backend dependencies
- Node.js and npm
- Arduino IDE or a compatible firmware development environment
- Required hardware drivers and board support packages

### 1. Clone the repository

```bash
git clone https://github.com/PruthviSB1715/SPROUT.git
cd SPROUT
```

### 2. Set up the frontend

```powershell
cd frontend
npm install
```

Configure the required environment variables using the provided example file, if applicable.

```powershell
Copy-Item .env.example .env
```

Edit the local environment file with the appropriate configuration. Never commit secrets or API keys.

### 3. Set up the backend

```powershell
cd ..\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the dependencies listed in the backend's requirements file, once populated:

```powershell
pip install -r requirements.txt
```

The exact startup command depends on the backend entry point and configuration.

### 4. Set up the hardware

1. Install the required board support package in the Arduino IDE.
2. Open the applicable rover firmware file from the hardware directory.
3. Select the correct board and communication port.
4. Verify that the required libraries are installed.
5. Connect the rover hardware and upload the firmware.
6. Test the sensors, camera servo, and other implemented controls.

Always verify the wiring and voltage requirements of the actual hardware before powering the rover.

---

## ▶️ Running the Application

### Frontend

From the frontend directory, run:

```powershell
npm run dev
```

Vite will display the local development URL in the terminal. Open that address in your browser.

### Backend

Start the backend using the command specified by its entry point and configuration. Ensure that any required model files and environment variables are available before starting it.

### Hardware

Upload the applicable firmware to the rover using the Arduino IDE or the appropriate programming utility. Verify hardware operation independently before connecting it to the software.

For a complete integrated demonstration, ensure that the frontend, backend, model files, and hardware communication configuration are compatible.

---

## 📊 Model Information

| Model / Experiment | Details |
|---|---|
| Tomato disease prototype | Healthy, Early blight, Late blight |
| Reported test accuracy | 96.89% |
| Multicrop preparation | Apple, Corn, Grape, Bell Pepper, Potato, Tomato |
| Multicrop preparation scope | 27 classes in the prepared experiment |
| Framework | TensorFlow / Keras |

The reported accuracy belongs to the specific tomato prototype evaluation. It does not represent the accuracy of every model, crop, or field condition.

---

## 📡 Offline Operation

SPROUT is designed with offline-capable processing as an architectural goal.

Local image inference can reduce dependence on external AI services when the model and its dependencies are installed on the local device.

However, offline operation depends on the available hardware, application configuration, and the particular workflow being used.

Features that require remote services or network communication may not be available without connectivity. Any simulated or fallback environmental readings should be clearly distinguished from actual sensor measurements.

---

## ⚠️ Current Limitations

The current prototype has several limitations that guide its future development.

- **Crop coverage:** Disease detection is limited to the classes supported by the deployed model.
- **Field generalization:** Laboratory or curated-dataset accuracy may differ from performance under real agricultural conditions.
- **Field navigation:** Rover operation can be constrained by narrow crop rows, uneven terrain, and plant spacing.
- **Camera coverage:** The camera's viewing range and mounting height may limit observation of tall crops and dense canopies.
- **Sensor coverage:** Temperature and humidity sensing are available in the current prototype; soil-moisture sensing is a planned addition.
- **Connectivity:** Some application and data synchronization workflows may depend on network availability.
- **Diagnosis:** AI predictions are advisory and should be validated before taking crop treatment decisions.

---

## 🚀 Future Scope

Potential areas of further development include:

- Expanding disease classification to more crops and disease categories.
- Collecting and evaluating real-world agricultural image datasets.
- Improving model robustness under different lighting and field conditions.
- Deploying optimized inference on edge devices.
- Integrating additional environmental sensors.
- Improving autonomous navigation and obstacle avoidance.
- Enhancing crop-row navigation for different agricultural layouts.
- Implementing reliable rover-to-dashboard telemetry.
- Developing a detachable, portable crop-scanning unit.
- Adding multilingual farmer-facing guidance.
- Integrating weather and irrigation decision-support data.
- Conducting field trials to evaluate real-world performance.

These are development directions and should not be interpreted as currently deployed features.

---

## 🤝 Contributing

Contributions to SPROUT are welcome.

To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Implement your changes.
4. Test the affected software or hardware components.
5. Commit your changes with a descriptive message.
6. Submit a pull request explaining the changes.

For substantial changes to model architecture, hardware interfaces, or application workflows, document the rationale and compatibility considerations.

---

## 🔒 Security and Data

- Never commit passwords, API keys, access tokens, or private environment files.
- Keep local configuration in untracked environment files.
- Do not upload large datasets or personally identifiable farmer data without appropriate authorization.
- Validate uploaded images and external inputs before processing.
- Review model and dataset licenses before redistribution.

---

## 📜 License

The project's license should be specified here before the repository is distributed publicly. Until a license is added, do not assume that others have permission to reuse or redistribute the project's code, models, or assets.

---

## 🌱 Project

**SPROUT — Smart Farming Assistant**

An integrated approach to AI-assisted crop health monitoring, mobile field observation, and climate-resilient agriculture.

**Repository:** https://github.com/PruthviSB1715/SPROUT
