#python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000 

from pathlib import Path
import sys
import traceback
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware


# ============================================================
# PATH CONFIGURATION
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

SRC_DIR = ROOT / "src"

if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))


# ============================================================
# IMPORT AI ENGINE
# ============================================================

try:

    from src.ai.diagnosis_engine import diagnose

    AI_AVAILABLE = True

    print("AI diagnosis engine loaded successfully.")

except Exception as e:

    AI_AVAILABLE = False

    print("WARNING: Could not load diagnosis engine.")
    print(e)

    diagnose = None


# ============================================================
# SENSOR SIMULATOR
# ============================================================

try:

    from simulator.sensors import (
        get_sensor_data,
        get_rover_status
    )

    SENSOR_AVAILABLE = True

except Exception as e:

    SENSOR_AVAILABLE = False

    print("WARNING: Sensor simulator unavailable.")
    print(e)

    get_sensor_data = None
    get_rover_status = None


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Smart Farm Rover AI",
    description="AI-powered Smart Farming Assistant backend",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# LATEST DIAGNOSIS STORAGE
# ============================================================

latest_diagnosis = {
    "available": False,
    "filename": None,
    "result": None,
    "timestamp": None
}


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "name": "Smart Farm Rover AI",
        "status": "online",
        "version": "1.0.0"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health_check():

    return {
        "status": "healthy",

        "services": {
            "ai_engine": (
                "available"
                if AI_AVAILABLE
                else "unavailable"
            ),

            "sensor_system": (
                "available"
                if SENSOR_AVAILABLE
                else "unavailable"
            )
        }
    }


# ============================================================
# SENSOR DATA
# ============================================================

@app.get("/api/sensors")
def sensors():

    if not SENSOR_AVAILABLE:

        raise HTTPException(
            status_code=503,
            detail="Sensor system is unavailable."
        )

    return {
        "status": "success",
        "source": "simulator",
        "data": get_sensor_data()
    }


# ============================================================
# ROVER STATUS
# ============================================================

@app.get("/api/rover/status")
def rover_status():

    if not SENSOR_AVAILABLE:

        raise HTTPException(
            status_code=503,
            detail="Rover status system is unavailable."
        )

    return {
        "status": "success",
        "data": get_rover_status()
    }


# ============================================================
# AI DIAGNOSIS
# ============================================================

@app.post("/api/diagnose")
async def diagnose_image(
    file: UploadFile = File(...)
):

    global latest_diagnosis


    # --------------------------------------------------------
    # Check AI
    # --------------------------------------------------------

    if not AI_AVAILABLE:

        raise HTTPException(
            status_code=503,
            detail="AI diagnosis engine is not available."
        )


    # --------------------------------------------------------
    # Validate file
    # --------------------------------------------------------

    if not file.content_type:

        raise HTTPException(
            status_code=400,
            detail="File type could not be determined."
        )


    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp"
    }


    if file.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail=(
                "Only JPG, JPEG, PNG and WEBP "
                "images are supported."
            )
        )


    # --------------------------------------------------------
    # Temporary image
    # --------------------------------------------------------

    temp_dir = ROOT / "test_images"

    temp_dir.mkdir(
        parents=True,
        exist_ok=True
    )


    temp_path = (
        temp_dir /
        "_api_uploaded_image.jpg"
    )


    try:

        contents = await file.read()

        if not contents:

            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty."
            )


        with open(temp_path, "wb") as f:

            f.write(contents)


        # ----------------------------------------------------
        # RUN AI
        # ----------------------------------------------------

        result = diagnose(temp_path)


        # ----------------------------------------------------
        # SAVE LATEST DIAGNOSIS
        # ----------------------------------------------------

        latest_diagnosis = {

            "available": True,

            "filename": file.filename,

            "result": result,

            "timestamp": datetime.now().isoformat()
        }


        # ----------------------------------------------------
        # RETURN RESULT
        # ----------------------------------------------------

        return {

            "status": "success",

            "filename": file.filename,

            "timestamp": latest_diagnosis["timestamp"],

            "diagnosis": result
        }


    except HTTPException:

        raise


    except Exception as e:

        print("\nAI DIAGNOSIS ERROR")

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


    finally:

        # ----------------------------------------------------
        # Delete temporary image
        # ----------------------------------------------------

        try:

            if temp_path.exists():

                temp_path.unlink()

        except Exception:

            pass


# ============================================================
# LATEST DIAGNOSIS
# ============================================================

@app.get("/api/diagnosis/latest")
def get_latest_diagnosis():

    return {
        "status": "success",
        "data": latest_diagnosis
    }


# ============================================================
# UNIFIED DASHBOARD API
# ============================================================

@app.get("/api/dashboard")
def dashboard():

    # --------------------------------------------------------
    # GET ONE SENSOR READING
    # --------------------------------------------------------

    if SENSOR_AVAILABLE:

        try:
            sensor_data = get_sensor_data()

        except Exception as e:

            print("Sensor error:", e)

            sensor_data = {}

    else:

        sensor_data = {}


    # --------------------------------------------------------
    # ROVER STATUS
    # --------------------------------------------------------

    rover_data = {

        "rover_status": "offline"
        if not SENSOR_AVAILABLE
        else "online",

        "sensor_status": (
            "simulated"
            if SENSOR_AVAILABLE
            else "unavailable"
        ),

        "sensors": sensor_data,

        "timestamp": sensor_data.get(
            "timestamp"
        )
    }


    # --------------------------------------------------------
    # DASHBOARD RESPONSE
    # --------------------------------------------------------

    return {

        "status": "success",

        "timestamp": datetime.now().isoformat(),

        "rover": rover_data,

        "environment": sensor_data,

        "diagnosis": latest_diagnosis
    }