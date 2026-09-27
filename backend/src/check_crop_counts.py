from pathlib import Path

ROOT = Path("PlantVillage-Dataset/raw/color")

for folder in sorted(ROOT.iterdir()):
    if folder.is_dir():
        count = sum(
            1 for f in folder.iterdir()
            if f.suffix.lower() in {".jpg", ".jpeg", ".png"}
        )

        print(f"{folder.name:60} {count:5}")