from pathlib import Path
import random
import shutil

# ============================================================
# CROP RECOGNIZER DATASET PREPARATION
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

SOURCE_DIR = ROOT / "PlantVillage-Dataset" / "raw" / "color"
OUTPUT_DIR = ROOT / "dataset_crop"

CROPS = {
    "Apple": "Apple___",
    "Corn": "Corn_(maize)___",
    "Grape": "Grape___",
    "Pepper": "Pepper,_bell___",
    "Potato": "Potato___",
    "Tomato": "Tomato___",
}

MAX_IMAGES_PER_CROP = 2000

TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

SEED = 42

random.seed(SEED)

print("=" * 70)
print("CROP RECOGNIZER DATASET PREPARATION")
print("=" * 70)

print(f"\nSelected crops: {len(CROPS)}")
print(f"Maximum images/crop: {MAX_IMAGES_PER_CROP}")
print(f"Random seed: {SEED}")

print("\nCrops:")
for crop in CROPS:
    print(f"   {crop}")

# ------------------------------------------------------------
# Clean old dataset
# ------------------------------------------------------------

if OUTPUT_DIR.exists():
    print("\nRemoving previous dataset...")
    shutil.rmtree(OUTPUT_DIR)

# ------------------------------------------------------------
# Create directories
# ------------------------------------------------------------

for split in ["train", "validation", "test"]:
    for crop in CROPS:
        (OUTPUT_DIR / split / crop).mkdir(
            parents=True,
            exist_ok=True
        )

# ------------------------------------------------------------
# Find images belonging to each crop
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("COLLECTING CROP IMAGES")
print("=" * 70)

crop_images = {}

for crop, folder_prefix in CROPS.items():

    images = []

    for class_dir in SOURCE_DIR.iterdir():

        if not class_dir.is_dir():
            continue

        if not class_dir.name.startswith(folder_prefix):
            continue

        class_images = list(class_dir.glob("*.jpg"))
        class_images += list(class_dir.glob("*.JPG"))
        class_images += list(class_dir.glob("*.jpeg"))
        class_images += list(class_dir.glob("*.png"))

        images.extend(class_images)

    # Remove duplicates
    images = list(set(images))

    # Shuffle
    random.shuffle(images)

    # Limit number
    if len(images) > MAX_IMAGES_PER_CROP:
        images = images[:MAX_IMAGES_PER_CROP]

    crop_images[crop] = images

    print(f"{crop:<10}: {len(images)} images")

# ------------------------------------------------------------
# Dataset statistics
# ------------------------------------------------------------

total_images = sum(len(v) for v in crop_images.values())

print(f"\nTotal images: {total_images}")

# ------------------------------------------------------------
# Split dataset
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("CREATING DATASET SPLITS")
print("=" * 70)

total_train = 0
total_val = 0
total_test = 0

for crop, images in crop_images.items():

    random.shuffle(images)

    total = len(images)

    train_end = int(total * TRAIN_RATIO)
    val_end = train_end + int(total * VAL_RATIO)

    train_images = images[:train_end]
    val_images = images[train_end:val_end]
    test_images = images[val_end:]

    # Copy training images
    for image in train_images:
        destination = OUTPUT_DIR / "train" / crop / image.name
        shutil.copy2(image, destination)

    # Copy validation images
    for image in val_images:
        destination = OUTPUT_DIR / "validation" / crop / image.name
        shutil.copy2(image, destination)

    # Copy test images
    for image in test_images:
        destination = OUTPUT_DIR / "test" / crop / image.name
        shutil.copy2(image, destination)

    total_train += len(train_images)
    total_val += len(val_images)
    total_test += len(test_images)

    print(
        f"{crop:<10} "
        f"Total {total:4d} | "
        f"Train {len(train_images):4d} | "
        f"Val {len(val_images):4d} | "
        f"Test {len(test_images):4d}"
    )

# ------------------------------------------------------------
# Final statistics
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("DATASET READY")
print("=" * 70)

print(f"\nClasses : {len(CROPS)}")
print(f"Images  : {total_images}")

print("\nTRAIN")
print(f"  {total_train}")

print("\nVALIDATION")
print(f"  {total_val}")

print("\nTEST")
print(f"  {total_test}")

print("\nExpected split:")
print("  Train      : 70%")
print("  Validation : 15%")
print("  Test       : 15%")

print("\nDataset location:")
print(OUTPUT_DIR)

print("\n" + "=" * 70)