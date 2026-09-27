from pathlib import Path
import random
import shutil

# ============================================================
# MULTICROP DATASET PREPARATION
# ============================================================

SOURCE_ROOT = Path("PlantVillage-Dataset/raw/color")
OUTPUT_ROOT = Path("dataset_multicrop")

MAX_IMAGES_PER_CLASS = 800

TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

SEED = 42

random.seed(SEED)

# ------------------------------------------------------------
# Crops we selected
# ------------------------------------------------------------

SELECTED_CROPS = [
    "Apple",
    "Corn_(maize)",
    "Grape",
    "Pepper,_bell",
    "Potato",
    "Tomato",
]

# ------------------------------------------------------------
# Find selected classes
# ------------------------------------------------------------

classes = []

for folder in sorted(SOURCE_ROOT.iterdir()):

    if not folder.is_dir():
        continue

    class_name = folder.name

    if any(class_name.startswith(crop + "___") for crop in SELECTED_CROPS):
        classes.append(folder)

print("=" * 70)
print("MULTICROP DATASET PREPARATION")
print("=" * 70)

print(f"\nSelected crops: {len(SELECTED_CROPS)}")
print(f"Maximum images/class: {MAX_IMAGES_PER_CLASS}")
print(f"Random seed: {SEED}")

print("\nClasses selected:")

for folder in classes:
    print("  ", folder.name)

print(f"\nTotal classes: {len(classes)}")

# ------------------------------------------------------------
# Validate
# ------------------------------------------------------------

if len(classes) != 27:
    print(
        f"\nWARNING: Expected 27 classes, but found {len(classes)}."
    )

# ------------------------------------------------------------
# Prepare output directories
# ------------------------------------------------------------

for split in ["train", "validation", "test"]:

    split_dir = OUTPUT_ROOT / split

    split_dir.mkdir(
        parents=True,
        exist_ok=True
    )

# ------------------------------------------------------------
# Process each class
# ------------------------------------------------------------

total_images = 0
total_train = 0
total_val = 0
total_test = 0

print("\n" + "=" * 70)
print("PROCESSING CLASSES")
print("=" * 70)

for class_dir in classes:

    class_name = class_dir.name

    images = [
        file
        for file in class_dir.iterdir()
        if file.is_file()
        and file.suffix.lower() in {
            ".jpg",
            ".jpeg",
            ".png"
        }
    ]

    # Shuffle deterministically
    random.shuffle(images)

    original_count = len(images)

    # Limit large classes
    images = images[:MAX_IMAGES_PER_CLASS]

    selected_count = len(images)

    # Calculate split sizes
    train_count = int(selected_count * TRAIN_RATIO)
    val_count = int(selected_count * VAL_RATIO)

    test_count = (
        selected_count
        - train_count
        - val_count
    )

    train_images = images[:train_count]

    val_images = images[
        train_count:
        train_count + val_count
    ]

    test_images = images[
        train_count + val_count:
    ]

    # Create class directories
    train_dir = OUTPUT_ROOT / "train" / class_name
    val_dir = OUTPUT_ROOT / "validation" / class_name
    test_dir = OUTPUT_ROOT / "test" / class_name

    train_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    val_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    test_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    # Copy files
    for image in train_images:
        shutil.copy2(
            image,
            train_dir / image.name
        )

    for image in val_images:
        shutil.copy2(
            image,
            val_dir / image.name
        )

    for image in test_images:
        shutil.copy2(
            image,
            test_dir / image.name
        )

    total_images += selected_count
    total_train += len(train_images)
    total_val += len(val_images)
    total_test += len(test_images)

    print(
        f"{class_name:55} "
        f"{original_count:5} → "
        f"{selected_count:4} | "
        f"Train {len(train_images):3} | "
        f"Val {len(val_images):3} | "
        f"Test {len(test_images):3}"
    )

# ------------------------------------------------------------
# Summary
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("DATASET READY")
print("=" * 70)

print(f"\nClasses : {len(classes)}")
print(f"Images  : {total_images}")

print("\nTRAIN")
print(f"  {total_train}")

print("\nVALIDATION")
print(f"  {total_val}")

print("\nTEST")
print(f"  {total_test}")

print("\nExpected split:")
print(f"  Train      : {TRAIN_RATIO * 100:.0f}%")
print(f"  Validation : {VAL_RATIO * 100:.0f}%")
print(f"  Test       : {TEST_RATIO * 100:.0f}%")

print("\nDataset location:")
print(OUTPUT_ROOT.resolve())

print("\n" + "=" * 70)