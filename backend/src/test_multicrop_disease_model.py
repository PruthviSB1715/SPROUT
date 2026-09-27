from pathlib import Path
import json
import numpy as np
import tensorflow as tf

from tensorflow.keras.models import load_model
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score
)


# ============================================================
# CONFIG
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

MODEL_PATH = ROOT / "models" / "multicrop_disease_model.keras"
CLASS_PATH = ROOT / "models" / "multicrop_class_names.json"
DATASET_DIR = ROOT / "dataset_multicrop" / "test"

OUTPUT_DIR = ROOT / "evaluation" / "multicrop_disease"

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32


# ============================================================
# HEADER
# ============================================================

print("=" * 70)
print("MULTICROP DISEASE MODEL EVALUATION")
print("=" * 70)

print("\nModel:")
print(MODEL_PATH)

print("\nTest dataset:")
print(DATASET_DIR)


# ============================================================
# CHECK FILES
# ============================================================

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Model not found:\n{MODEL_PATH}"
    )

if not CLASS_PATH.exists():
    raise FileNotFoundError(
        f"Class names file not found:\n{CLASS_PATH}"
    )

if not DATASET_DIR.exists():
    raise FileNotFoundError(
        f"Test dataset not found:\n{DATASET_DIR}"
    )


# ============================================================
# LOAD CLASS NAMES
# ============================================================

with open(CLASS_PATH, "r", encoding="utf-8") as f:
    class_names = json.load(f)

print("\nClasses:")
for i, name in enumerate(class_names):
    print(f"{i:2d}: {name}")

print(f"\nNumber of classes: {len(class_names)}")


# ============================================================
# LOAD MODEL
# ============================================================

print("\n" + "=" * 70)
print("LOADING MODEL")
print("=" * 70)

model = load_model(MODEL_PATH)

print("Model loaded successfully.")

output_classes = model.output_shape[-1]

print("Model output classes:", output_classes)

if output_classes != len(class_names):
    raise ValueError(
        "\nMODEL / CLASS NAME MISMATCH\n"
        f"Model outputs : {output_classes}\n"
        f"Class names   : {len(class_names)}"
    )


# ============================================================
# LOAD TEST DATASET
# ============================================================

print("\n" + "=" * 70)
print("LOADING TEST DATASET")
print("=" * 70)

test_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

dataset_class_names = test_ds.class_names

print("\nDataset classes detected:")

for i, name in enumerate(dataset_class_names):
    print(f"{i:2d}: {name}")


# ============================================================
# VERIFY CLASS ORDER
# ============================================================

if dataset_class_names != class_names:

    print("\nWARNING:")
    print("Dataset class order does not exactly match")
    print("multicrop_class_names.json")

    print("\nModel class names:")
    print(class_names)

    print("\nDataset class names:")
    print(dataset_class_names)

    raise ValueError(
        "\nCLASS ORDER MISMATCH\n"
        "The dataset and model class mapping are different."
    )


# ============================================================
# PREPROCESSING
# ============================================================

print("\n" + "=" * 70)
print("PREPROCESSING")
print("=" * 70)

# IMPORTANT:
# The multicrop training model uses MobileNetV2
# preprocess_input inside the model itself.
#
# Therefore DO NOT divide images by 255 here.

print(
    "Using raw 0-255 images because MobileNetV2 "
    "preprocessing is included inside the trained model."
)


# ============================================================
# PREDICTIONS
# ============================================================

print("\n" + "=" * 70)
print("GENERATING PREDICTIONS")
print("=" * 70)

y_true = []
y_pred = []
confidences = []

total = 0

for images, labels in test_ds:

    predictions = model.predict(
        images,
        verbose=0
    )

    predicted_classes = np.argmax(
        predictions,
        axis=1
    )

    prediction_confidences = np.max(
        predictions,
        axis=1
    )

    y_true.extend(labels.numpy())
    y_pred.extend(predicted_classes)
    confidences.extend(prediction_confidences)

    total += len(labels)

    print(
        f"\rProcessed: {total}",
        end=""
    )

print()


# ============================================================
# CONVERT TO NUMPY
# ============================================================

y_true = np.array(y_true)
y_pred = np.array(y_pred)
confidences = np.array(confidences)


# ============================================================
# OVERALL ACCURACY
# ============================================================

accuracy = accuracy_score(
    y_true,
    y_pred
)


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print("\n" + "=" * 70)
print("CLASSIFICATION REPORT")
print("=" * 70)

report = classification_report(
    y_true,
    y_pred,
    target_names=class_names,
    digits=4,
    zero_division=0
)

print(report)


# ============================================================
# CONFUSION MATRIX
# ============================================================

print("=" * 70)
print("CONFUSION MATRIX")
print("=" * 70)

cm = confusion_matrix(
    y_true,
    y_pred
)

print("\nRows = Actual")
print("Columns = Predicted\n")

print("     " + " ".join(f"{i:5d}" for i in range(len(class_names))))

for i, row in enumerate(cm):

    print(
        f"{i:2d}: "
        + " ".join(
            f"{value:5d}"
            for value in row
        )
    )


# ============================================================
# PER-CLASS ACCURACY
# ============================================================

print("\n" + "=" * 70)
print("PER-CLASS ACCURACY")
print("=" * 70)

for i, class_name in enumerate(class_names):

    total_class = np.sum(y_true == i)

    correct_class = np.sum(
        (y_true == i) &
        (y_pred == i)
    )

    if total_class > 0:
        class_accuracy = (
            correct_class /
            total_class
        ) * 100
    else:
        class_accuracy = 0

    print(
        f"{class_name:<55} "
        f"{class_accuracy:6.2f}% "
        f"({correct_class}/{total_class})"
    )


# ============================================================
# CONFIDENCE
# ============================================================

average_confidence = np.mean(confidences)

print("\n" + "=" * 70)
print("CONFIDENCE")
print("=" * 70)

print(
    f"\nAverage prediction confidence: "
    f"{average_confidence * 100:.2f}%"
)


# ============================================================
# SAVE RESULTS
# ============================================================

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ------------------------------------------------------------
# Classification report
# ------------------------------------------------------------

report_path = (
    OUTPUT_DIR /
    "classification_report.txt"
)

with open(
    report_path,
    "w",
    encoding="utf-8"
) as f:

    f.write(report)


# ------------------------------------------------------------
# Confusion matrix
# ------------------------------------------------------------

cm_path = (
    OUTPUT_DIR /
    "confusion_matrix.npy"
)

np.save(
    cm_path,
    cm
)


# ------------------------------------------------------------
# Metrics JSON
# ------------------------------------------------------------

metrics = {
    "model": str(MODEL_PATH),
    "dataset": str(DATASET_DIR),

    "num_classes": len(class_names),

    "classes": class_names,

    "test_samples": int(len(y_true)),

    "accuracy": float(accuracy),

    "accuracy_percent": float(
        accuracy * 100
    ),

    "average_confidence": float(
        average_confidence
    ),

    "average_confidence_percent": float(
        average_confidence * 100
    )
}

metrics_path = (
    OUTPUT_DIR /
    "metrics.json"
)

with open(
    metrics_path,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        metrics,
        f,
        indent=4
    )


# ============================================================
# FINAL SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("EVALUATION SUMMARY")
print("=" * 70)

print(
    f"\nTest samples : {len(y_true)}"
)

print(
    f"Test Accuracy: {accuracy * 100:.2f}%"
)

print(
    f"Avg Confidence: "
    f"{average_confidence * 100:.2f}%"
)

print("\nEvaluation files:")

print(
    "\nClassification report:"
)

print(report_path)

print(
    "\nConfusion matrix:"
)

print(cm_path)

print(
    "\nMetrics JSON:"
)

print(metrics_path)

print("\n" + "=" * 70)
print("EVALUATION COMPLETE")
print("=" * 70)