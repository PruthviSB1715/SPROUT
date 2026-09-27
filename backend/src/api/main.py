from pathlib import Path
import sys
import traceback

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ============================================================
# PATH SETUP
# ============================================================

ROOT = Path(__file__).resolve().parent.parent.parent

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# ============================================================
# IMPORT DIAGNOSIS ENGINE
# ============================================================

try:
    from src.ai.diagnosis_engine import diagnose
except Exception as e:
    print("ERROR: Could not import diagnosis engine.")
    print(e)
    diagnose = None

# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="Smart Farm Rover AI",
    description="AI-powered crop and disease diagnosis API",
    version="1.0.0"
)

# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():
    return {
        "system": "Smart Farm Rover AI",
        "status": "online",
        "service": "AI Diagnosis API"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "diagnosis-api"
    }


# ============================================================
# DIAGNOSIS
# ============================================================

@app.post("/api/diagnose")
async def diagnose_image(
    file: UploadFile = File(...)
):

    if diagnose is None:
        raise HTTPException(
            status_code=500,
            detail="Diagnosis engine could not be loaded."
        )

    # --------------------------------------------------------
    # Validate file
    # --------------------------------------------------------

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    }

    filename = file.filename or "uploaded_image"

    extension = Path(filename).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format."
        )

    # --------------------------------------------------------
    # Temporary image
    # --------------------------------------------------------

    temp_dir = ROOT / "temp"
    temp_dir.mkdir(exist_ok=True)

    temp_path = temp_dir / filename

    try:

        # ----------------------------------------------------
        # Save uploaded image
        # ----------------------------------------------------

        contents = await file.read()

        with open(temp_path, "wb") as f:
            f.write(contents)

        print("\n" + "=" * 70)
        print("NEW DIAGNOSIS REQUEST")
        print("=" * 70)

        print("Image:", filename)

        # ----------------------------------------------------
        # Run AI diagnosis
        # ----------------------------------------------------

        result = diagnose(temp_path)

        print("\nDiagnosis completed.")

        # ----------------------------------------------------
        # Return result
        # ----------------------------------------------------

        return {
            "success": True,
            "filename": filename,
            "diagnosis": result
        }

    except Exception as e:

        print("\nDIAGNOSIS ERROR")
        print("=" * 70)

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
# RUN
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "src.api.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )