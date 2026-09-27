from pathlib import Path
import sys
import json
import re

import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image


# ============================================================
# SMART-FARM ROVER
# FINAL AI DIAGNOSIS
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

# ------------------------------------------------------------
# MODEL PATHS
# ------------------------------------------------------------

CROP_MODEL_PATH = ROOT / "models" / "crop_recognizer.keras"
CROP_CLASS_PATH = ROOT / "models" / "crop_class_names.json"

DISEASE_MODEL_PATH = ROOT / "models" / "multicrop_disease_model.keras"
DISEASE_CLASS_PATH = ROOT / "models" / "multicrop_class_names.json"

IMAGE_SIZE = (224, 224)


# ============================================================
# CROP MAPPING
# ============================================================

CROP_PREFIXES = {
    "Apple": "Apple___",
    "Corn": "Corn_(maize)___",
    "Grape": "Grape___",
    "Pepper": "Pepper,_bell___",
    "Potato": "Potato___",
    "Tomato": "Tomato___",
}


# ============================================================
# DISPLAY HELPERS
# ============================================================

def clean_crop_name(name):
    """
    Convert internal crop names into user-friendly names.
    """

    mapping = {
        "Apple": "Apple",
        "Corn": "Corn",
        "Grape": "Grape",
        "Pepper": "Pepper",
        "Potato": "Potato",
        "Tomato": "Tomato",
    }

    return mapping.get(name, name)


def clean_disease_name(class_name):
    """
    Convert PlantVillage class name into readable disease name.

    Example:

    Tomato___Early_blight
    ->
    Early blight

    Corn_(maize)___Common_rust_
    ->
    Common rust
    """

    if "___" in class_name:
        disease = class_name.split("___", 1)[1]
    else:
        disease = class_name

    disease = disease.replace("_", " ")

    disease = re.sub(r"\s+", " ", disease)

    disease = disease.strip()

    return disease


def is_healthy(disease_name):
    return "healthy" in disease_name.lower()


def get_crop_from_disease_class(class_name):
    """
    Determine which crop a disease class belongs to.
    """

    for crop, prefix in CROP_PREFIXES.items():

        if class_name.startswith(prefix):
            return crop

    return None


# ============================================================
# ARGUMENT CHECK
# ============================================================

if len(sys.argv) < 2:

    print("=" * 70)
    print("SMART-FARM ROVER - AI DIAGNOSIS")
    print("=" * 70)

    print("\nUsage:")
    print("python src/diagnose.py test_images/tomato.jpg")

    print("\nExample:")
    print("python src/diagnose.py test_images/pepper.jpg")

    sys.exit(1)


IMAGE_PATH = Path(sys.argv[1])

# Allow relative paths from project root
if not IMAGE_PATH.is_absolute():
    IMAGE_PATH = ROOT / IMAGE_PATH


# ============================================================
# HEADER
# ============================================================

print("=" * 70)
print("SMART-FARM ROVER - AI DIAGNOSIS")
print("=" * 70)


# ============================================================
# IMAGE INFORMATION
# ============================================================

print("\nIMAGE")
print("-" * 70)

print("Input :", sys.argv[1])
print("Path  :", IMAGE_PATH.resolve())


if not IMAGE_PATH.exists():

    print("\nERROR: Image not found.")

    print("\nExpected path:")
    print(IMAGE_PATH.resolve())

    sys.exit(1)


# ============================================================
# LOAD MODELS
# ============================================================

print("\nLoading AI models...")

try:

    crop_model = load_model(
        CROP_MODEL_PATH
    )

    with open(
        CROP_CLASS_PATH,
        "r",
        encoding="utf-8"
    ) as f:

        crop_class_names = json.load(f)

    print("Crop recognizer loaded successfully.")

except Exception as e:

    print("\nERROR loading crop recognizer:")
    print(e)

    sys.exit(1)


try:

    disease_model = load_model(
        DISEASE_MODEL_PATH
    )

    with open(
        DISEASE_CLASS_PATH,
        "r",
        encoding="utf-8"
    ) as f:

        disease_class_names = json.load(f)

    print("Disease classifier loaded successfully.")

except Exception as e:

    print("\nERROR loading disease classifier:")
    print(e)

    sys.exit(1)


# ============================================================
# LOAD IMAGE
# ============================================================

try:

    img = image.load_img(
        IMAGE_PATH,
        target_size=IMAGE_SIZE
    )

    img_array = image.img_to_array(img)

except Exception as e:

    print("\nERROR loading image:")
    print(e)

    sys.exit(1)


print("\nImage shape :", img_array.shape)

# IMPORTANT:
#
# DO NOT DO:
#
# img_array = img_array / 255.0
#
# Both models were trained with MobileNetV2
# preprocess_input() inside their architecture.
#
# Therefore the input must remain approximately 0-255.
#


img_array = np.expand_dims(
    img_array,
    axis=0
)


# ============================================================
# CROP RECOGNITION
# ============================================================

print("\n" + "=" * 70)
print("CROP RECOGNITION")
print("=" * 70)

print("\nRunning crop recognition...")

crop_predictions = crop_model.predict(
    img_array,
    verbose=0
)[0]


crop_top_indices = np.argsort(
    crop_predictions
)[::-1][:5]


best_crop_idx = crop_top_indices[0]

predicted_crop = crop_class_names[
    best_crop_idx
]

crop_confidence = (
    crop_predictions[best_crop_idx] * 100
)


print("\nCrop       :", clean_crop_name(predicted_crop))

print(
    "Confidence :",
    f"{crop_confidence:.2f}%"
)


# ============================================================
# CROP CONFIDENCE STATUS
# ============================================================

if crop_confidence >= 90:

    crop_status = "HIGH CONFIDENCE"

elif crop_confidence >= 70:

    crop_status = "MEDIUM CONFIDENCE"

else:

    crop_status = "LOW CONFIDENCE"


print("Status     :", crop_status)


# ============================================================
# TOP CROP PREDICTIONS
# ============================================================

print("\nTOP 5 CROP PREDICTIONS")
print("-" * 70)

for rank, idx in enumerate(
    crop_top_indices,
    start=1
):

    print(
        f"{rank}. "
        f"{clean_crop_name(crop_class_names[idx]):18s} "
        f"{crop_predictions[idx] * 100:.2f}%"
    )


# ============================================================
# DISEASE PREDICTION
# ============================================================

print("\n" + "=" * 70)
print("DISEASE ANALYSIS")
print("=" * 70)

print(
    f"\nRunning disease analysis for {predicted_crop}..."
)


disease_predictions = disease_model.predict(
    img_array,
    verbose=0
)[0]


# ============================================================
# FILTER DISEASE CLASSES
# ============================================================

crop_disease_indices = []

for idx, class_name in enumerate(
    disease_class_names
):

    disease_crop = get_crop_from_disease_class(
        class_name
    )

    if disease_crop == predicted_crop:

        crop_disease_indices.append(idx)


# ============================================================
# SAFETY CHECK
# ============================================================

if len(crop_disease_indices) == 0:

    print(
        "\nERROR: No disease classes found for crop:"
    )

    print(predicted_crop)

    print("\nAvailable disease classes:")

    for name in disease_class_names:
        print(" ", name)

    sys.exit(1)


# ============================================================
# SORT ONLY CROP-SPECIFIC DISEASES
# ============================================================

filtered_predictions = []

for idx in crop_disease_indices:

    filtered_predictions.append(
        (
            idx,
            disease_predictions[idx]
        )
    )


filtered_predictions.sort(
    key=lambda x: x[1],
    reverse=True
)


# Best disease
best_disease_idx = filtered_predictions[0][0]

best_disease_class = disease_class_names[
    best_disease_idx
]

best_disease_confidence = (
    disease_predictions[best_disease_idx] * 100
)

best_disease_name = clean_disease_name(
    best_disease_class
)


# ============================================================
# DISEASE RESULT
# ============================================================

print("\nCrop       :", clean_crop_name(predicted_crop))

print(
    "Disease    :",
    best_disease_name
)

print(
    "Confidence :",
    f"{best_disease_confidence:.2f}%"
)


if is_healthy(best_disease_name):

    disease_status = "HEALTHY"

else:

    disease_status = "DISEASE DETECTED"


print("\nStatus     :", disease_status)


# ============================================================
# TOP DISEASE PREDICTIONS
# ============================================================

print("\nTOP DISEASE PREDICTIONS")
print("-" * 70)

top_diseases = filtered_predictions[:5]

for rank, (idx, probability) in enumerate(
    top_diseases,
    start=1
):

    disease_name = clean_disease_name(
        disease_class_names[idx]
    )

    print(
        f"{rank}. "
        f"{disease_name:45s} "
        f"{probability * 100:.2f}%"
    )


# ============================================================
# FINAL DIAGNOSIS
# ============================================================

print("\n" + "=" * 70)
print("FINAL DIAGNOSIS")
print("=" * 70)

print(
    "\nCrop       :",
    clean_crop_name(predicted_crop)
)

print(
    "Crop Conf. :",
    f"{crop_confidence:.2f}%"
)

print(
    "Disease    :",
    best_disease_name
)

print(
    "Disease Conf:",
    f"{best_disease_confidence:.2f}%"
)


# ============================================================
# FINAL RESULT
# ============================================================

if is_healthy(best_disease_name):

    print(
        "\nRESULT     : PLANT APPEARS HEALTHY"
    )

else:

    print(
        "\nRESULT     : DISEASE DETECTED"
    )


# ============================================================
# PIPELINE INFORMATION
# ============================================================

print("\n" + "=" * 70)
print("AI PIPELINE")
print("=" * 70)

print("\nImage")
print("  ↓")
print("Crop Recognition")
print(
    f"  ↓ {clean_crop_name(predicted_crop)} "
    f"({crop_confidence:.2f}%)"
)
print("  ↓")
print("Crop-specific Disease Filtering")
print("  ↓")
print(best_disease_name)
print(
    f"  ({best_disease_confidence:.2f}%)"
)
print("  ↓")
print("Final Diagnosis")


print("\n" + "=" * 70)
print("DIAGNOSIS COMPLETE")
print("=" * 70)