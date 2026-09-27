import json
from pathlib import Path

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2

# ============================================================
# MULTICROP AI v1
# 27-Class Crop Disease Classification
# ============================================================

DATASET_DIR = Path("dataset_multicrop")
MODEL_DIR = Path("models")

MODEL_DIR.mkdir(parents=True, exist_ok=True)

TRAIN_DIR = DATASET_DIR / "train"
VAL_DIR = DATASET_DIR / "validation"
TEST_DIR = DATASET_DIR / "test"

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 15
SEED = 42

MODEL_PATH = MODEL_DIR / "multicrop_disease_model.keras"
CLASS_NAMES_PATH = MODEL_DIR / "multicrop_class_names.json"
HISTORY_PATH = MODEL_DIR / "multicrop_training_history.json"
METADATA_PATH = MODEL_DIR / "multicrop_model_metadata.json"

print("=" * 70)
print("MULTICROP AI v1 - TRAINING")
print("=" * 70)

print("\nTensorFlow version:", tf.__version__)

# ============================================================
# GPU CHECK
# ============================================================

gpus = tf.config.list_physical_devices("GPU")

if gpus:
    print("GPU detected:", gpus)
else:
    print("No GPU detected - training on CPU")

# ============================================================
# LOAD DATASETS
# ============================================================

print("\nLoading training dataset...")

train_ds = tf.keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True,
    seed=SEED
)

print("\nLoading validation dataset...")

val_ds = tf.keras.utils.image_dataset_from_directory(
    VAL_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

print("\nLoading test dataset...")

test_ds = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

class_names = train_ds.class_names
num_classes = len(class_names)

print("\n" + "=" * 70)
print("DATASET INFORMATION")
print("=" * 70)

print("\nNumber of classes:", num_classes)

print("\nClasses:")

for i, name in enumerate(class_names):
    print(f"{i:2d}: {name}")

# Save class names
with open(CLASS_NAMES_PATH, "w", encoding="utf-8") as f:
    json.dump(class_names, f, indent=4)

print("\nClass names saved to:")
print(CLASS_NAMES_PATH.resolve())

# ============================================================
# PERFORMANCE OPTIMIZATION
# ============================================================

AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)
test_ds = test_ds.prefetch(AUTOTUNE)

# ============================================================
# DATA AUGMENTATION
# ============================================================

data_augmentation = keras.Sequential(
    [
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
        layers.RandomContrast(0.1),
    ],
    name="data_augmentation"
)

# ============================================================
# BASE MODEL
# ============================================================

print("\n" + "=" * 70)
print("BUILDING MODEL")
print("=" * 70)

base_model = MobileNetV2(
    input_shape=IMG_SIZE + (3,),
    include_top=False,
    weights="imagenet"
)

# Freeze pretrained layers for initial training
base_model.trainable = False

print("\nBase model: MobileNetV2")
print("Image size:", IMG_SIZE)
print("Classes:", num_classes)
print("Trainable base model:", base_model.trainable)

# ============================================================
# CLASSIFICATION HEAD
# ============================================================

inputs = keras.Input(
    shape=IMG_SIZE + (3,),
    name="image"
)

x = data_augmentation(inputs)

# MobileNetV2 expects pixel values approximately [-1, 1]
x = layers.Rescaling(
    1.0 / 127.5,
    offset=-1
)(x)

x = base_model(
    x,
    training=False
)

x = layers.GlobalAveragePooling2D()(x)

x = layers.Dropout(0.3)(x)

outputs = layers.Dense(
    num_classes,
    activation="softmax",
    name="predictions"
)(x)

model = keras.Model(
    inputs,
    outputs,
    name="MultiCrop_Disease_AI"
)

# ============================================================
# COMPILE
# ============================================================

model.compile(
    optimizer=keras.optimizers.Adam(
        learning_rate=0.001
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# ============================================================
# CALLBACKS
# ============================================================

callbacks = [

    keras.callbacks.ModelCheckpoint(
        MODEL_PATH,
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1
    ),

    keras.callbacks.EarlyStopping(
        monitor="val_accuracy",
        patience=4,
        restore_best_weights=True,
        verbose=1
    ),

    keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.3,
        patience=2,
        min_lr=1e-6,
        verbose=1
    )
]

# ============================================================
# TRAIN
# ============================================================

print("\n" + "=" * 70)
print("STARTING TRAINING")
print("=" * 70)

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    callbacks=callbacks
)

# ============================================================
# SAVE HISTORY
# ============================================================

history_data = {
    key: [float(v) for v in values]
    for key, values in history.history.items()
}

with open(HISTORY_PATH, "w", encoding="utf-8") as f:
    json.dump(history_data, f, indent=4)

# ============================================================
# LOAD BEST MODEL
# ============================================================

print("\nLoading best saved model...")

model = keras.models.load_model(MODEL_PATH)

# ============================================================
# TEST EVALUATION
# ============================================================

print("\n" + "=" * 70)
print("TEST SET EVALUATION")
print("=" * 70)

test_loss, test_accuracy = model.evaluate(
    test_ds,
    verbose=1
)

print("\nTest Loss:", test_loss)
print("Test Accuracy:", test_accuracy)

# ============================================================
# METADATA
# ============================================================

metadata = {
    "model_name": "MultiCrop Disease AI v1",
    "architecture": "MobileNetV2",
    "image_size": list(IMG_SIZE),
    "num_classes": num_classes,
    "batch_size": BATCH_SIZE,
    "epochs_requested": EPOCHS,
    "seed": SEED,
    "test_accuracy": float(test_accuracy),
    "test_loss": float(test_loss),
    "dataset": "PlantVillage selected multicrop dataset",
    "crops": [
        "Apple",
        "Corn",
        "Grape",
        "Pepper",
        "Potato",
        "Tomato"
    ]
}

with open(METADATA_PATH, "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=4)

# ============================================================
# COMPLETE
# ============================================================

print("\n" + "=" * 70)
print("MULTICROP AI v1 TRAINING COMPLETE")
print("=" * 70)

print("\nModel saved to:")
print(MODEL_PATH.resolve())

print("\nClass names saved to:")
print(CLASS_NAMES_PATH.resolve())

print("\nTraining history saved to:")
print(HISTORY_PATH.resolve())

print("\nMetadata saved to:")
print(METADATA_PATH.resolve())

print("\nFinal test accuracy:")
print(f"{test_accuracy * 100:.2f}%")

print("\n" + "=" * 70)