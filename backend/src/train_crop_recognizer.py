from pathlib import Path
import json
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# ============================================================
# CROP RECOGNIZER TRAINING
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

DATASET_DIR = ROOT / "dataset_crop"
MODEL_DIR = ROOT / "models"

MODEL_DIR.mkdir(exist_ok=True)

TRAIN_DIR = DATASET_DIR / "train"
VAL_DIR = DATASET_DIR / "validation"

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 15
SEED = 42

print("=" * 70)
print("CROP RECOGNIZER TRAINING")
print("=" * 70)

print(f"\nDataset : {DATASET_DIR}")
print(f"Image size : {IMG_SIZE}")
print(f"Batch size : {BATCH_SIZE}")
print(f"Epochs : {EPOCHS}")

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

class_names = train_ds.class_names

print("\nClasses detected:")
for i, name in enumerate(class_names):
    print(f"{i}: {name}")

print(f"\nNumber of classes: {len(class_names)}")

# ============================================================
# PERFORMANCE
# ============================================================

AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)

# ============================================================
# DATA AUGMENTATION
# ============================================================

data_augmentation = keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.15),
    layers.RandomZoom(0.15),
    layers.RandomContrast(0.10),
], name="data_augmentation")

# ============================================================
# MODEL
# ============================================================

print("\nBuilding model...")

base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

# Freeze pretrained layers initially
base_model.trainable = False

inputs = keras.Input(shape=(224, 224, 3))

x = data_augmentation(inputs)

x = tf.keras.applications.mobilenet_v2.preprocess_input(x)

x = base_model(x, training=False)

x = layers.GlobalAveragePooling2D()(x)

x = layers.Dropout(0.25)(x)

outputs = layers.Dense(
    len(class_names),
    activation="softmax"
)(x)

model = keras.Model(inputs, outputs)

# ============================================================
# COMPILE
# ============================================================

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# ============================================================
# CALLBACKS
# ============================================================

model_path = MODEL_DIR / "crop_recognizer.keras"

callbacks = [
    keras.callbacks.ModelCheckpoint(
        model_path,
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
# SAVE CLASS NAMES
# ============================================================

class_names_path = MODEL_DIR / "crop_class_names.json"

with open(class_names_path, "w", encoding="utf-8") as f:
    json.dump(class_names, f, indent=4)

# ============================================================
# SAVE TRAINING HISTORY
# ============================================================

history_path = MODEL_DIR / "crop_training_history.json"

with open(history_path, "w", encoding="utf-8") as f:
    json.dump(
        {
            key: [float(v) for v in values]
            for key, values in history.history.items()
        },
        f,
        indent=4
    )

# ============================================================
# FINAL VALIDATION
# ============================================================

print("\n" + "=" * 70)
print("FINAL VALIDATION")
print("=" * 70)

loss, accuracy = model.evaluate(val_ds)

print(f"\nValidation Loss     : {loss:.6f}")
print(f"Validation Accuracy : {accuracy * 100:.2f}%")

print("\n" + "=" * 70)
print("CROP RECOGNIZER TRAINING COMPLETE")
print("=" * 70)

print("\nModel saved to:")
print(model_path)

print("\nClass names saved to:")
print(class_names_path)

print("\nTraining history saved to:")
print(history_path)

print(f"\nFinal validation accuracy: {accuracy * 100:.2f}%")

print("\n" + "=" * 70)