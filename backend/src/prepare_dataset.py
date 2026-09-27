from pathlib import Path
import shutil

from sklearn.model_selection import train_test_split


# ============================================================
# CONFIGURATION
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

SOURCE_ROOT = (
    PROJECT_ROOT
    / "PlantVillage-Dataset"
    / "raw"
    / "color"
)

DATASET_ROOT = PROJECT_ROOT / "dataset"

CLASSES = {
    "Tomato___healthy": "healthy",
    "Tomato___Early_blight": "early_blight",
    "Tomato___Late_blight": "late_blight",
}

RANDOM_STATE = 42


# ============================================================
# COLLECT IMAGES
# ============================================================

print("=" * 60)
print("COLLECTING TOMATO IMAGES")
print("=" * 60)

images = []
labels = []

for source_class, output_class in CLASSES.items():

    class_dir = SOURCE_ROOT / source_class

    files = list(class_dir.glob("*.JPG"))

    print(f"{output_class:15s}: {len(files)} images")

    for image in files:
        images.append(image)
        labels.append(output_class)


print(f"\nTotal images: {len(images)}")


# ============================================================
# TRAIN / TEMP
# ============================================================

train_images, temp_images, train_labels, temp_labels = (
    train_test_split(
        images,
        labels,
        test_size=0.30,
        stratify=labels,
        random_state=RANDOM_STATE,
    )
)


# ============================================================
# VALIDATION / TEST
# ============================================================

validation_images, test_images, validation_labels, test_labels = (
    train_test_split(
        temp_images,
        temp_labels,
        test_size=0.50,
        stratify=temp_labels,
        random_state=RANDOM_STATE,
    )
)


splits = {
    "train": (train_images, train_labels),
    "validation": (validation_images, validation_labels),
    "test": (test_images, test_labels),
}


# ============================================================
# CREATE DIRECTORIES
# ============================================================

print("\nCreating dataset directories...")

for split in splits:

    for class_name in CLASSES.values():

        directory = DATASET_ROOT / split / class_name

        directory.mkdir(
            parents=True,
            exist_ok=True
        )


# ============================================================
# COPY IMAGES
# ============================================================

for split, (split_images, split_labels) in splits.items():

    print(f"\nPreparing {split}...")

    for image_path, label in zip(
        split_images,
        split_labels
    ):

        destination = (
            DATASET_ROOT
            / split
            / label
            / image_path.name
        )

        shutil.copy2(
            image_path,
            destination
        )

    print(f"{split}: {len(split_images)} images")


# ============================================================
# SUMMARY
# ============================================================

print("\n" + "=" * 60)
print("DATASET READY")
print("=" * 60)

for split in splits:

    print(f"\n{split.upper()}")

    for class_name in CLASSES.values():

        count = len(
            list(
                (
                    DATASET_ROOT
                    / split
                    / class_name
                ).glob("*")
            )
        )

        print(f"  {class_name:15s}: {count}")


print("\nDataset location:")
print(DATASET_ROOT)