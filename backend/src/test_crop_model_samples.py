from pathlib import Path
import json
import random

import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image


# ============================================================
# CONFIG
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

MODEL_PATH = ROOT / "models" / "crop_recognizer.keras"
CLASS_PATH = ROOT / "models" / "crop_class_names.json"

TEST_DIR = ROOT / "dataset_crop" / "test"

IMAGE_SIZE = (224, 224)

SAMPLES_PER_CLASS = 1

SEED = 42

random.seed(SEED)


# ============================================================
# HEADER
# ============================================================

print("=" * 70)
print("CROP MODEL DATASET DIAGNOSTIC")
print("=" * 70)


# ============================================================
# LOAD MODEL
# ============================================================

print("\nLoading model...")

model = load_model(MODEL_PATH)

with open(CLASS_PATH, "r", encoding="utf-8") as f:
    class_names = json.load(f)

print("Model loaded successfully.")

print("\nClasses:")
for i, name in enumerate(class_names):
    print(f"  {i}: {name}")


# ============================================================
# DATASET CHECK
# ============================================================

if not TEST_DIR.exists():
    raise FileNotFoundError(
        f"Test dataset not found:\n{TEST_DIR}"
    )


# ============================================================
# TEST DATASET IMAGES
# ============================================================

print("\n" + "=" * 70)
print("TESTING ACTUAL DATASET IMAGES")
print("=" * 70)


correct = 0
wrong = 0

results = []


for actual_class in class_names:

    class_dir = TEST_DIR / actual_class

    if not class_dir.exists():

        print(
            f"\nWARNING: Missing class directory: "
            f"{class_dir}"
        )

        continue

    # --------------------------------------------------------
    # Collect images
    # --------------------------------------------------------

    image_files = []

    for pattern in [
        "*.jpg",
        "*.JPG",
        "*.jpeg",
        "*.JPEG",
        "*.png",
        "*.PNG"
    ]:

        image_files.extend(class_dir.glob(pattern))

    image_files = list(set(image_files))

    if len(image_files) == 0:

        print(
            f"\nWARNING: No images found for {actual_class}"
        )

        continue

    # --------------------------------------------------------
    # Select samples
    # --------------------------------------------------------

    random.shuffle(image_files)

    samples = image_files[:SAMPLES_PER_CLASS]

    # --------------------------------------------------------
    # Test each sample
    # --------------------------------------------------------

    for image_path in samples:

        print("\n" + "-" * 70)

        print(f"Actual class : {actual_class}")
        print(f"Image        : {image_path.relative_to(ROOT)}")

        # ----------------------------------------------------
        # Load image
        # ----------------------------------------------------

        img = image.load_img(
            image_path,
            target_size=IMAGE_SIZE
        )

        img_array = image.img_to_array(img)

        print(f"Image shape  : {img_array.shape}")

        # ----------------------------------------------------
        # IMPORTANT
        # ----------------------------------------------------
        #
        # DO NOT divide by 255 here.
        #
        # The model already contains:
        #
        # mobilenet_v2.preprocess_input()
        #
        # during its forward pass.
        #
        # Therefore the input must remain approximately:
        #
        # 0 - 255
        #
        # ----------------------------------------------------

        print(
            f"Pixel range : "
            f"{img_array.min():.2f} - "
            f"{img_array.max():.2f}"
        )

        img_array = np.expand_dims(
            img_array,
            axis=0
        )

        # ----------------------------------------------------
        # Prediction
        # ----------------------------------------------------

        predictions = model.predict(
            img_array,
            verbose=0
        )[0]

        # ----------------------------------------------------
        # Top predictions
        # ----------------------------------------------------

        top_indices = np.argsort(
            predictions
        )[::-1][:3]

        best_idx = top_indices[0]

        predicted_class = class_names[best_idx]

        confidence = predictions[best_idx] * 100

        is_correct = predicted_class == actual_class

        if is_correct:
            correct += 1
            status = "CORRECT"
        else:
            wrong += 1
            status = "WRONG"

        print(
            f"Predicted    : {predicted_class}"
        )

        print(
            f"Confidence   : {confidence:.2f}%"
        )

        print(
            f"Status       : {status}"
        )

        # ----------------------------------------------------
        # Top 3
        # ----------------------------------------------------

        print("\nTop 3 predictions:")

        for rank, idx in enumerate(
            top_indices,
            start=1
        ):

            print(
                f"  {rank}. "
                f"{class_names[idx]:12s} "
                f"{predictions[idx] * 100:.2f}%"
            )

        results.append({
            "actual": actual_class,
            "predicted": predicted_class,
            "confidence": float(confidence),
            "correct": is_correct
        })


# ============================================================
# SUMMARY
# ============================================================

total = correct + wrong

accuracy = (
    correct / total * 100
    if total > 0
    else 0
)


print("\n" + "=" * 70)
print("DIAGNOSTIC SUMMARY")
print("=" * 70)

print(f"\nClasses tested : {len(class_names)}")
print(f"Correct        : {correct}")
print(f"Wrong          : {wrong}")
print(f"Accuracy       : {accuracy:.2f}%")

print("\n" + "=" * 70)
print("DIAGNOSTIC COMPLETE")
print("=" * 70)