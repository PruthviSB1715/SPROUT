import json
from pathlib import Path

import numpy as np
import tensorflow as tf
from tensorflow import keras

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    precision_recall_fscore_support
)

# ============================================================
# MULTICROP AI v1 - MODEL EVALUATION
# ============================================================

DATASET_DIR = Path("dataset_multicrop")
MODEL_DIR = Path("models")

TEST_DIR = DATASET_DIR / "test"

MODEL_PATH = MODEL_DIR / "multicrop_disease_model.keras"
CLASS_NAMES_PATH = MODEL_DIR / "multicrop_class_names.json"

RESULTS_DIR = Path("evaluation")
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

IMG_SIZE = (224, 224)
BATCH_SIZE = 32

REPORT_PATH = RESULTS_DIR / "classification_report.txt"
CM_PATH = RESULTS_DIR / "confusion_matrix.npy"
METRICS_PATH = RESULTS_DIR / "evaluation_metrics.json"


# ============================================================
# HEADER
# ============================================================

print("=" * 70)
print("MULTICROP AI v1 - MODEL EVALUATION")
print("=" * 70)


# ============================================================
# CHECK FILES
# ============================================================

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Model not found:\n{MODEL_PATH.resolve()}"
    )

if not CLASS_NAMES_PATH.exists():
    raise FileNotFoundError(
        f"Class names file not found:\n{CLASS_NAMES_PATH.resolve()}"
    )

if not TEST_DIR.exists():
    raise FileNotFoundError(
        f"Test dataset not found:\n{TEST_DIR.resolve()}"
    )


# ============================================================
# LOAD CLASS NAMES
# ============================================================

with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
    class_names = json.load(f)

num_classes = len(class_names)

print("\nNumber of classes:", num_classes)


# ============================================================
# LOAD TEST DATASET
# ============================================================

print("\nLoading test dataset...")

test_ds = keras.utils.image_dataset_from_directory(
    TEST_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

print("\nDataset classes detected by TensorFlow:")

for i, name in enumerate(test_ds.class_names):
    print(f"{i:2d}: {name}")


# ============================================================
# VERIFY CLASS ORDER
# ============================================================

if test_ds.class_names != class_names:

    print("\nWARNING!")
    print("Class ordering in the test dataset does not match")
    print("the saved class_names.json file.")

    print("\nSaved classes:")
    print(class_names)

    print("\nDataset classes:")
    print(test_ds.class_names)

    raise ValueError(
        "Class order mismatch. Evaluation stopped to prevent "
        "incorrect metrics."
    )


# ============================================================
# PERFORMANCE
# ============================================================

AUTOTUNE = tf.data.AUTOTUNE

test_ds = test_ds.prefetch(AUTOTUNE)


# ============================================================
# LOAD MODEL
# ============================================================

print("\nLoading trained model...")

model = keras.models.load_model(MODEL_PATH)

print("Model loaded successfully.")


# ============================================================
# MODEL EVALUATION
# ============================================================

print("\n" + "=" * 70)
print("MODEL EVALUATION")
print("=" * 70)

test_loss, test_accuracy = model.evaluate(
    test_ds,
    verbose=1
)

print("\nTest Loss:")
print(f"{test_loss:.6f}")

print("\nTest Accuracy:")
print(f"{test_accuracy * 100:.2f}%")


# ============================================================
# GENERATE PREDICTIONS
# ============================================================

print("\n" + "=" * 70)
print("GENERATING PREDICTIONS")
print("=" * 70)

y_true = []
y_pred = []

for images, labels in test_ds:

    predictions = model.predict(
        images,
        verbose=0
    )

    predicted_classes = np.argmax(
        predictions,
        axis=1
    )

    y_true.extend(
        labels.numpy()
    )

    y_pred.extend(
        predicted_classes
    )

y_true = np.array(y_true)
y_pred = np.array(y_pred)


# ============================================================
# SANITY CHECK
# ============================================================

print("\nTotal test samples:")
print(len(y_true))

if len(y_true) != len(y_pred):
    raise RuntimeError(
        "Number of predictions does not match number of labels."
    )


# ============================================================
# ACCURACY
# ============================================================

accuracy = accuracy_score(
    y_true,
    y_pred
)


# ============================================================
# PRECISION / RECALL / F1
# ============================================================

precision, recall, f1, support = (
    precision_recall_fscore_support(
        y_true,
        y_pred,
        labels=np.arange(num_classes),
        zero_division=0
    )
)

macro_precision = np.mean(precision)
macro_recall = np.mean(recall)
macro_f1 = np.mean(f1)

weighted_precision = (
    np.average(
        precision,
        weights=support
    )
)

weighted_recall = (
    np.average(
        recall,
        weights=support
    )
)

weighted_f1 = (
    np.average(
        f1,
        weights=support
    )
)


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

report = classification_report(
    y_true,
    y_pred,
    target_names=class_names,
    digits=4,
    zero_division=0
)

print("\n" + "=" * 70)
print("CLASSIFICATION REPORT")
print("=" * 70)

print(report)


# ============================================================
# CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(
    y_true,
    y_pred,
    labels=np.arange(num_classes)
)

print("\n" + "=" * 70)
print("CONFUSION MATRIX")
print("=" * 70)

print(
    "Rows = Actual"
)
print(
    "Columns = Predicted"
)

print()

# Print shortened numbered matrix
print("     " + " ".join(
    f"{i:4d}" for i in range(num_classes)
))

for i, row in enumerate(cm):

    print(
        f"{i:2d}: " +
        " ".join(
            f"{value:4d}"
            for value in row
        )
    )


# ============================================================
# WORST CLASSES
# ============================================================

print("\n" + "=" * 70)
print("LOWEST PERFORMING CLASSES")
print("=" * 70)

class_results = []

for i, class_name in enumerate(class_names):

    class_results.append(
        {
            "class": class_name,
            "precision": float(precision[i]),
            "recall": float(recall[i]),
            "f1": float(f1[i]),
            "support": int(support[i])
        }
    )

# Sort by F1 score
worst_classes = sorted(
    class_results,
    key=lambda x: x["f1"]
)

for result in worst_classes[:10]:

    print(
        f"\n{result['class']}"
    )

    print(
        f"  Precision : {result['precision']:.4f}"
    )

    print(
        f"  Recall    : {result['recall']:.4f}"
    )

    print(
        f"  F1-score  : {result['f1']:.4f}"
    )

    print(
        f"  Support   : {result['support']}"
    )


# ============================================================
# MOST COMMON CONFUSIONS
# ============================================================

print("\n" + "=" * 70)
print("MOST COMMON CONFUSIONS")
print("=" * 70)

confusions = []

for actual in range(num_classes):

    for predicted in range(num_classes):

        if actual == predicted:
            continue

        count = cm[actual, predicted]

        if count > 0:

            confusions.append(
                {
                    "actual": class_names[actual],
                    "predicted": class_names[predicted],
                    "count": int(count)
                }
            )

confusions.sort(
    key=lambda x: x["count"],
    reverse=True
)

for confusion in confusions[:15]:

    print(
        f"\nActual    : {confusion['actual']}"
    )

    print(
        f"Predicted : {confusion['predicted']}"
    )

    print(
        f"Images    : {confusion['count']}"
    )


# ============================================================
# SAVE CLASSIFICATION REPORT
# ============================================================

report_text = ""

report_text += "=" * 70 + "\n"
report_text += "MULTICROP AI v1 - CLASSIFICATION REPORT\n"
report_text += "=" * 70 + "\n\n"

report_text += f"Test samples : {len(y_true)}\n"
report_text += f"Accuracy     : {accuracy:.6f}\n"
report_text += f"Test loss    : {test_loss:.6f}\n\n"

report_text += "Macro metrics:\n"
report_text += f"Precision : {macro_precision:.6f}\n"
report_text += f"Recall    : {macro_recall:.6f}\n"
report_text += f"F1-score  : {macro_f1:.6f}\n\n"

report_text += "Weighted metrics:\n"
report_text += f"Precision : {weighted_precision:.6f}\n"
report_text += f"Recall    : {weighted_recall:.6f}\n"
report_text += f"F1-score  : {weighted_f1:.6f}\n\n"

report_text += "=" * 70 + "\n"
report_text += "PER-CLASS REPORT\n"
report_text += "=" * 70 + "\n\n"

report_text += report

report_text += "\n\n"
report_text += "=" * 70 + "\n"
report_text += "MOST COMMON CONFUSIONS\n"
report_text += "=" * 70 + "\n\n"

for confusion in confusions[:15]:

    report_text += (
        f"{confusion['actual']} -> "
        f"{confusion['predicted']} : "
        f"{confusion['count']}\n"
    )

REPORT_PATH.write_text(
    report_text,
    encoding="utf-8"
)


# ============================================================
# SAVE CONFUSION MATRIX
# ============================================================

np.save(
    CM_PATH,
    cm
)


# ============================================================
# SAVE METRICS JSON
# ============================================================

metrics = {

    "model": "MultiCrop AI v1",

    "test_samples": int(len(y_true)),

    "test_loss": float(test_loss),

    "accuracy": float(accuracy),

    "macro": {
        "precision": float(macro_precision),
        "recall": float(macro_recall),
        "f1": float(macro_f1)
    },

    "weighted": {
        "precision": float(weighted_precision),
        "recall": float(weighted_recall),
        "f1": float(weighted_f1)
    },

    "classes": class_results,

    "worst_classes": worst_classes[:10],

    "most_common_confusions": confusions[:15]
}

with open(
    METRICS_PATH,
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
    f"\nAccuracy       : {accuracy * 100:.2f}%"
)

print(
    f"Macro F1      : {macro_f1 * 100:.2f}%"
)

print(
    f"Weighted F1   : {weighted_f1 * 100:.2f}%"
)

print(
    f"Macro Recall  : {macro_recall * 100:.2f}%"
)

print(
    f"Macro Precision: {macro_precision * 100:.2f}%"
)

print("\nEvaluation files:")

print(
    f"\nClassification report:"
)
print(
    REPORT_PATH.resolve()
)

print(
    f"\nConfusion matrix:"
)
print(
    CM_PATH.resolve()
)

print(
    f"\nMetrics JSON:"
)
print(
    METRICS_PATH.resolve()
)

print("\n" + "=" * 70)
print("EVALUATION COMPLETE")
print("=" * 70)