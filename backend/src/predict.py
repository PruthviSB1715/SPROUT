import sys
import json
from pathlib import Path

import numpy as np
import tensorflow as tf


# ============================================================
# CONFIG
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

MODEL_PATH = PROJECT_ROOT / "models" / "tomato_disease_model.keras"
CLASS_NAMES_PATH = PROJECT_ROOT / "models" / "class_names.json"

IMAGE_SIZE = (224, 224)


# ============================================================
# CHECK ARGUMENT
# ============================================================

if len(sys.argv) != 2:

    print("\nUsage:")
    print("python src/predict.py <image_path>")
    print("\nExample:")
    print("python src/predict.py test_images/tomato.jpg")

    sys.exit(1)


IMAGE_PATH = Path(sys.argv[1])


if not IMAGE_PATH.exists():

    print(f"\nERROR: Image not found:")
    print(IMAGE_PATH)

    sys.exit(1)


# ============================================================
# LOAD MODEL
# ============================================================

print("\nLoading Smart Farm AI model...")

model = tf.keras.models.load_model(
    MODEL_PATH
)


# ============================================================
# LOAD CLASS NAMES
# ============================================================

with open(
    CLASS_NAMES_PATH,
    "r",
    encoding="utf-8"
) as f:

    class_names = json.load(f)


# ============================================================
# LOAD IMAGE
# ============================================================

image = tf.keras.utils.load_img(
    IMAGE_PATH,
    target_size=IMAGE_SIZE
)

image_array = tf.keras.utils.img_to_array(
    image
)

image_array = np.expand_dims(
    image_array,
    axis=0
)


# ============================================================
# PREPROCESS
# ============================================================

# image_array = (
#     tf.keras.applications
#     .mobilenet_v2
#     .preprocess_input(image_array)
# )


# ============================================================
# PREDICT
# ============================================================

predictions = model.predict(
    image_array,
    verbose=0
)[0]


predicted_index = int(
    np.argmax(predictions)
)

predicted_class = class_names[
    predicted_index
]

confidence = float(
    predictions[predicted_index]
)


# ============================================================
# DISPLAY
# ============================================================

pretty_name = predicted_class.replace(
    "_",
    " "
).title()


print("\n" + "=" * 60)
print("SMART FARM AI — CROP HEALTH ANALYSIS")
print("=" * 60)

print(f"\nCrop        : Tomato")
print(f"Diagnosis   : {pretty_name}")
print(f"Confidence  : {confidence * 100:.2f}%")


# ============================================================
# RECOMMENDATION
# ============================================================

if predicted_class == "healthy":

    status = "HEALTHY"

    recommendation = (
        "No visible disease detected. "
        "Continue regular crop monitoring."
    )

elif predicted_class == "early_blight":

    status = "DISEASE DETECTED"

    recommendation = (
        "Possible Early Blight detected. "
        "Inspect nearby plants and consider "
        "targeted disease management."
    )

elif predicted_class == "late_blight":

    status = "DISEASE DETECTED"

    recommendation = (
        "Possible Late Blight detected. "
        "Inspect the surrounding crop immediately "
        "and consider targeted intervention."
    )

else:

    status = "UNKNOWN"

    recommendation = (
        "Unknown condition. Capture another image "
        "with better lighting and positioning."
    )


print(f"\nStatus      : {status}")

print("\nRecommendation:")
print(recommendation)

print("\n" + "=" * 60)