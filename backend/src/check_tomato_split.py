from pathlib import Path
from collections import Counter

REPO = Path("PlantVillage-Dataset")

TRAIN_FILE = REPO / "data_distribution_for_SVM" / "train_mapping.txt"
TEST_FILE = REPO / "data_distribution_for_SVM" / "test_mapping.txt"

TARGET_CLASSES = {
    "Tomato___healthy",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
}


def process_file(file_path, split):
    results = []

    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()

            if not line:
                continue

            # Find the beginning of the SVM destination path.
            svm_index = line.find("SVM/")

            if svm_index == -1:
                continue

            # Everything before SVM/ is the original image path.
            original_path = line[:svm_index].strip()

            normalized = original_path.replace("\\", "/")

            for class_name in TARGET_CLASSES:

                if f"raw/color/{class_name}/" in normalized:

                    results.append({
                        "class": class_name,
                        "path": original_path,
                        "split": split
                    })

                    break

    return results


train = process_file(TRAIN_FILE, "train")
test = process_file(TEST_FILE, "test")

all_data = train + test

print("=" * 60)
print("TOMATO DATASET SPLIT")
print("=" * 60)

counter = Counter(
    (item["class"], item["split"])
    for item in all_data
)

for class_name in sorted(TARGET_CLASSES):

    train_count = counter[(class_name, "train")]
    test_count = counter[(class_name, "test")]

    print(f"\n{class_name}")
    print(f"  Train: {train_count}")
    print(f"  Test : {test_count}")
    print(f"  Total: {train_count + test_count}")

print("\n" + "=" * 60)
print("TOTAL")
print("=" * 60)

print(f"Train: {len(train)}")
print(f"Test : {len(test)}")
print(f"Total: {len(all_data)}")

print("\nFirst 3 matches:")

for item in all_data[:3]:
    print(item)