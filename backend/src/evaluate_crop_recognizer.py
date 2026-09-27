from pathlib import Path
import json
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix

# ============================================================
# CROP RECOGNIZER - MODEL EVALUATION
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

TEST_DIR = ROOT / "dataset_crop" / "test"
MODEL_PATH = ROOT / "models" / "crop_recognizer.keras"
CLASS_NAMES_PATH = ROOT / "models" / "crop_class_names.json"

print("=" * 70)
print("CROP RECOGNIZER - MODEL EVALUATION")
print("=" * 70)

# ------------------------------------------------------------
# Load class names
# ------------------------------------------------------------

with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
    class_names = json.load(f)

print(f"\nNumber of classes: {len(class_names)}")

print("\nClasses:")
for i, name in enumerate(class_names):
    print(f"{i}: {name}")

# ------------------------------------------------------------
# Load test dataset
# ------------------------------------------------------------

print("\nLoading test dataset...")

test_ds = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    image_size=(224, 224),
    batch_size=32,
    shuffle=False
)

print("\nDataset classes detected by TensorFlow:")

for i, name in enumerate(test_ds.class_names):
    print(f"{i}: {name}")

# ------------------------------------------------------------
# Load model
# ------------------------------------------------------------

print("\nLoading trained model...")

model = tf.keras.models.load_model(MODEL_PATH)

print("Model loaded successfully.")

# ------------------------------------------------------------
# Evaluate
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("MODEL EVALUATION")
print("=" * 70)

loss, accuracy = model.evaluate(test_ds)

print(f"\nTest Loss:")
print(f"{loss:.6f}")

print(f"\nTest Accuracy:")
print(f"{accuracy * 100:.2f}%")

# ------------------------------------------------------------
# Generate predictions
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("GENERATING PREDICTIONS")
print("=" * 70)

y_true = []
y_pred = []

for images, labels in test_ds:

    predictions = model.predict(images, verbose=0)

    predicted_classes = np.argmax(predictions, axis=1)

    y_true.extend(labels.numpy())
    y_pred.extend(predicted_classes)

y_true = np.array(y_true)
y_pred = np.array(y_pred)

print(f"\nTotal test samples: {len(y_true)}")

# ------------------------------------------------------------
# Classification report
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("CLASSIFICATION REPORT")
print("=" * 70)

report = classification_report(
    y_true,
    y_pred,
    target_names=class_names,
    digits=4
)

print(report)

# ------------------------------------------------------------
# Confusion matrix
# ------------------------------------------------------------

print("=" * 70)
print("CONFUSION MATRIX")
print("=" * 70)

cm = confusion_matrix(y_true, y_pred)

print("\nRows = Actual")
print("Columns = Predicted\n")

print("     " + " ".join(f"{i:5d}" for i in range(len(class_names))))

for i, row in enumerate(cm):
    print(f"{i:2d}: " + " ".join(f"{x:5d}" for x in row))

# ------------------------------------------------------------
# Per-class accuracy
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("PER-CLASS ACCURACY")
print("=" * 70)

for i, name in enumerate(class_names):

    total = cm[i].sum()

    if total == 0:
        class_accuracy = 0
    else:
        class_accuracy = cm[i, i] / total

    print(
        f"{name:<10} "
        f"{class_accuracy * 100:6.2f}% "
        f"({cm[i, i]}/{total})"
    )

# ------------------------------------------------------------
# Save evaluation
# ------------------------------------------------------------

EVALUATION_DIR = ROOT / "evaluation"
EVALUATION_DIR.mkdir(exist_ok=True)

report_path = EVALUATION_DIR / "crop_classification_report.txt"
cm_path = EVALUATION_DIR / "crop_confusion_matrix.npy"
metrics_path = EVALUATION_DIR / "crop_evaluation_metrics.json"

with open(report_path, "w", encoding="utf-8") as f:
    f.write(report)

np.save(cm_path, cm)

metrics = {
    "test_loss": float(loss),
    "test_accuracy": float(accuracy),
    "number_of_classes": len(class_names),
    "number_of_test_samples": int(len(y_true))
}

with open(metrics_path, "w", encoding="utf-8") as f:
    json.dump(metrics, f, indent=4)

# ------------------------------------------------------------
# Final summary
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("EVALUATION SUMMARY")
print("=" * 70)

print(f"\nTest Accuracy : {accuracy * 100:.2f}%")

print("\nEvaluation files:")

print(f"\nClassification report:")
print(report_path)

print("\nConfusion matrix:")
print(cm_path)

print("\nMetrics JSON:")
print(metrics_path)

print("\n" + "=" * 70)
print("EVALUATION COMPLETE")
print("=" * 70)