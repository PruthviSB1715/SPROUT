from pathlib import Path
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image


# ============================================================
# CROP MODEL DEBUG TEST
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

MODEL_PATH = ROOT / "models" / "crop_recognizer.keras"
CLASS_PATH = ROOT / "models" / "crop_class_names.json"

IMAGE_PATH = ROOT / "test_images" / "tomato.jpg"

IMAGE_SIZE = (224, 224)


print("=" * 70)
print("CROP MODEL DEBUG TEST")
print("=" * 70)


# ============================================================
# LOAD MODEL
# ============================================================

print("\nLoading model...")

model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASS_PATH, "r", encoding="utf-8") as f:
    class_names = json.load(f)

print("Model loaded successfully.")

print("Classes:")
for i, name in enumerate(class_names):
    print(f"  {i}: {name}")


# ============================================================
# LOAD IMAGE
# ============================================================

print("\n" + "=" * 70)
print("IMAGE")
print("=" * 70)

print("Path:", IMAGE_PATH.resolve())

if not IMAGE_PATH.exists():
    raise FileNotFoundError(
        f"Image not found: {IMAGE_PATH}"
    )


img = image.load_img(
    IMAGE_PATH,
    target_size=IMAGE_SIZE
)

img_array = image.img_to_array(img)

print("Loaded image shape:", img_array.shape)

print(
    "Pixel range before model preprocessing:",
    f"{img_array.min():.2f} - {img_array.max():.2f}"
)


# ============================================================
# IMPORTANT
# ============================================================
#
# DO NOT divide by 255 here.
#
# The trained model already contains:
#
#     MobileNetV2 preprocess_input()
#
# inside the model.
#
# Training pipeline:
#
#     image 0-255
#          ↓
#     preprocess_input()
#          ↓
#     approximately -1 to +1
#          ↓
#     MobileNetV2
#
# Therefore inference must also start with:
#
#     image 0-255
#
# ============================================================

img_array = np.expand_dims(img_array, axis=0)


# ============================================================
# PREDICTION
# ============================================================

print("\nRunning prediction...")

predictions = model.predict(
    img_array,
    verbose=0
)[0]


# ============================================================
# TOP PREDICTIONS
# ============================================================

top_indices = np.argsort(predictions)[::-1]


print("\n" + "=" * 70)
print("PREDICTION")
print("=" * 70)

for rank, idx in enumerate(top_indices, start=1):

    print(
        f"{rank}. "
        f"{class_names[idx]:10s} "
        f"{predictions[idx] * 100:.2f}%"
    )


# ============================================================
# FINAL
# ============================================================

best_idx = np.argmax(predictions)

print("\n" + "=" * 70)
print("FINAL")
print("=" * 70)

print("Predicted crop :", class_names[best_idx])
print(
    "Confidence     :",
    f"{predictions[best_idx] * 100:.2f}%"
)

print("=" * 70)