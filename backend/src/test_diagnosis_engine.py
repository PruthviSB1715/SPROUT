from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent

sys.path.insert(0, str(ROOT))

from src.ai.diagnosis_engine import diagnose


IMAGE = ROOT / "test_images" / "tomato.jpg"


print("=" * 70)
print("SMART FARM ROVER - DIAGNOSIS ENGINE TEST")
print("=" * 70)

result = diagnose(IMAGE)

print("\n" + "=" * 70)
print("RESULT")
print("=" * 70)

print("\nCrop:")
print(
    result["crop"]["name"],
    f"({result['crop']['confidence'] * 100:.2f}%)"
)

print("\nDisease:")

if result["disease"]["available"]:

    print(
        result["disease"]["disease"],
        f"({result['disease']['confidence'] * 100:.2f}%)"
    )

    print(
        "Status:",
        result["disease"]["status"]
    )

else:

    print("Disease model unavailable")

print("\n" + "=" * 70)