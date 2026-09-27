from pathlib import Path
import json
import numpy as np

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image


# ============================================================
# SMART FARM ROVER
# AI DIAGNOSIS ENGINE
#
# PIPELINE:
#
# Image
#   ↓
# Crop Recognizer
#   ↓
# Detected Crop
#   ↓
# Multicrop Disease Model
#   ↓
# Filter disease classes belonging to detected crop
#   ↓
# Final Diagnosis
#
# Supported Crops:
#   Apple
#   Corn
#   Grape
#   Pepper
#   Potato
#   Tomato
#
# Disease Model:
#   Single 27-class multicrop model
# ============================================================


# ============================================================
# ROOT
# ============================================================

ROOT = Path(__file__).resolve().parent.parent.parent


# ============================================================
# CROP RECOGNIZER
# ============================================================

CROP_MODEL_PATH = (
    ROOT / "models" / "crop_recognizer.keras"
)

CROP_CLASS_PATH = (
    ROOT / "models" / "crop_class_names.json"
)


# ============================================================
# MULTICROP DISEASE MODEL
# ============================================================

DISEASE_MODEL_PATH = (
    ROOT / "models" / "multicrop_disease_model.keras"
)

DISEASE_CLASS_PATH = (
    ROOT / "models" / "multicrop_class_names.json"
)

DISEASE_METADATA_PATH = (
    ROOT / "models" / "multicrop_model_metadata.json"
)


# ============================================================
# IMAGE CONFIG
# ============================================================

IMAGE_SIZE = (224, 224)


# ============================================================
# CONFIDENCE CONFIG
# ============================================================

# Crop recognition confidence levels

CROP_HIGH_CONFIDENCE = 0.80
CROP_MEDIUM_CONFIDENCE = 0.60


# Disease recognition confidence levels

DISEASE_HIGH_CONFIDENCE = 0.80
DISEASE_MEDIUM_CONFIDENCE = 0.50


# ============================================================
# MODEL CACHE
# ============================================================

_crop_model = None
_crop_classes = None

_disease_model = None
_disease_classes = None
_disease_metadata = None


# ============================================================
# SUPPORTED CROPS
# ============================================================

SUPPORTED_CROPS = [
    "Apple",
    "Corn",
    "Grape",
    "Pepper",
    "Potato",
    "Tomato",
]


# ============================================================
# DISEASE CLASS → CROP MAPPING
#
# These prefixes correspond to PlantVillage class names.
# ============================================================

CROP_PREFIXES = {

    "Apple":
        "Apple___",

    "Corn":
        "Corn_(maize)___",

    "Grape":
        "Grape___",

    "Pepper":
        "Pepper,_bell___",

    "Potato":
        "Potato___",

    "Tomato":
        "Tomato___",

}


# ============================================================
# LOAD CROP MODEL
# ============================================================

def load_crop_model():

    global _crop_model
    global _crop_classes

    # --------------------------------------------------------
    # Return cached model
    # --------------------------------------------------------

    if (
        _crop_model is not None
        and _crop_classes is not None
    ):

        return (
            _crop_model,
            _crop_classes
        )

    print("Loading crop recognizer...")

    # --------------------------------------------------------
    # Check model
    # --------------------------------------------------------

    if not CROP_MODEL_PATH.exists():

        raise FileNotFoundError(
            "\nCROP MODEL NOT FOUND\n"
            f"Expected:\n{CROP_MODEL_PATH}"
        )

    # --------------------------------------------------------
    # Check class file
    # --------------------------------------------------------

    if not CROP_CLASS_PATH.exists():

        raise FileNotFoundError(
            "\nCROP CLASS FILE NOT FOUND\n"
            f"Expected:\n{CROP_CLASS_PATH}"
        )

    # --------------------------------------------------------
    # Load model
    # --------------------------------------------------------

    _crop_model = load_model(
        CROP_MODEL_PATH
    )

    # --------------------------------------------------------
    # Load classes
    # --------------------------------------------------------

    with open(
        CROP_CLASS_PATH,
        "r",
        encoding="utf-8"
    ) as f:

        _crop_classes = json.load(f)

    # --------------------------------------------------------
    # Validate class mapping
    # --------------------------------------------------------

    model_outputs = (
        _crop_model.output_shape[-1]
    )

    if model_outputs != len(_crop_classes):

        raise ValueError(
            "\n"
            "==================================================\n"
            "CROP MODEL / CLASS NAME MISMATCH\n"
            "==================================================\n"
            f"Model outputs : {model_outputs}\n"
            f"Class names   : {len(_crop_classes)}\n"
            f"Class file    : {CROP_CLASS_PATH}\n"
        )

    # --------------------------------------------------------
    # Validate supported crops
    # --------------------------------------------------------

    for crop in _crop_classes:

        if crop not in SUPPORTED_CROPS:

            print(
                f"WARNING: Unexpected crop class: {crop}"
            )

    print("Crop recognizer loaded.")

    return (
        _crop_model,
        _crop_classes
    )


# ============================================================
# LOAD MULTICROP DISEASE MODEL
# ============================================================

def load_disease_model():

    global _disease_model
    global _disease_classes
    global _disease_metadata

    # --------------------------------------------------------
    # Return cached model
    # --------------------------------------------------------

    if (
        _disease_model is not None
        and _disease_classes is not None
    ):

        return (
            _disease_model,
            _disease_classes,
            _disease_metadata
        )

    print(
        "Loading multicrop disease model..."
    )

    # --------------------------------------------------------
    # Check model
    # --------------------------------------------------------

    if not DISEASE_MODEL_PATH.exists():

        raise FileNotFoundError(
            "\n"
            "MULTICROP DISEASE MODEL NOT FOUND\n"
            f"Expected:\n{DISEASE_MODEL_PATH}\n"
        )

    # --------------------------------------------------------
    # Check class file
    # --------------------------------------------------------

    if not DISEASE_CLASS_PATH.exists():

        raise FileNotFoundError(
            "\n"
            "MULTICROP DISEASE CLASS FILE NOT FOUND\n"
            f"Expected:\n{DISEASE_CLASS_PATH}\n"
        )

    # --------------------------------------------------------
    # Load model
    # --------------------------------------------------------

    _disease_model = load_model(
        DISEASE_MODEL_PATH
    )

    # --------------------------------------------------------
    # Load class names
    # --------------------------------------------------------

    with open(
        DISEASE_CLASS_PATH,
        "r",
        encoding="utf-8"
    ) as f:

        _disease_classes = json.load(f)

    # --------------------------------------------------------
    # Load metadata if available
    # --------------------------------------------------------

    if DISEASE_METADATA_PATH.exists():

        with open(
            DISEASE_METADATA_PATH,
            "r",
            encoding="utf-8"
        ) as f:

            _disease_metadata = json.load(f)

    else:

        _disease_metadata = {}

    # --------------------------------------------------------
    # Safety check
    # --------------------------------------------------------

    model_outputs = (
        _disease_model.output_shape[-1]
    )

    if model_outputs != len(_disease_classes):

        raise ValueError(
            "\n"
            "==================================================\n"
            "DISEASE MODEL / CLASS NAME MISMATCH\n"
            "==================================================\n"
            f"Model outputs : {model_outputs}\n"
            f"Class names   : {len(_disease_classes)}\n"
            f"Class file    : {DISEASE_CLASS_PATH}\n"
        )

    # --------------------------------------------------------
    # Print model information
    # --------------------------------------------------------

    print(
        f"Disease classes loaded: "
        f"{len(_disease_classes)}"
    )

    print(
        "Multicrop disease model loaded."
    )

    return (
        _disease_model,
        _disease_classes,
        _disease_metadata
    )


# ============================================================
# PREPARE IMAGE
# ============================================================

def prepare_image(image_path):

    image_path = Path(
        image_path
    )

    # --------------------------------------------------------
    # Check image
    # --------------------------------------------------------

    if not image_path.exists():

        raise FileNotFoundError(
            f"\nImage not found:\n{image_path}"
        )

    # --------------------------------------------------------
    # Load image
    # --------------------------------------------------------

    img = image.load_img(
        image_path,
        target_size=IMAGE_SIZE
    )

    # --------------------------------------------------------
    # Convert to array
    # --------------------------------------------------------

    img_array = image.img_to_array(
        img
    )

    # --------------------------------------------------------
    # IMPORTANT
    #
    # Do NOT divide by 255 here.
    #
    # Both models use MobileNetV2 preprocessing
    # internally or were trained expecting the
    # same preprocessing pipeline.
    # --------------------------------------------------------

    img_array = np.expand_dims(
        img_array,
        axis=0
    )

    return img_array


# ============================================================
# GET CROP FROM DISEASE CLASS
# ============================================================

def get_crop_from_disease_class(
    class_name
):

    for crop, prefix in CROP_PREFIXES.items():

        if class_name.startswith(prefix):

            return crop

    return None


# ============================================================
# GET CLEAN DISEASE NAME
# ============================================================

def clean_disease_name(
    class_name
):

    crop = get_crop_from_disease_class(
        class_name
    )

    if crop is None:

        return class_name

    prefix = CROP_PREFIXES[crop]

    disease = class_name[
        len(prefix):
    ]

    # --------------------------------------------------------
    # Clean PlantVillage formatting
    # --------------------------------------------------------

    disease = disease.replace(
        "_",
        " "
    )

    disease = disease.replace(
        "  ",
        " "
    )

    disease = disease.strip()

    return disease


# ============================================================
# CROP RECOGNITION
# ============================================================

def recognize_crop(
    image_path
):

    model, class_names = (
        load_crop_model()
    )

    # --------------------------------------------------------
    # Prepare image
    # --------------------------------------------------------

    img_array = prepare_image(
        image_path
    )

    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    predictions = model.predict(
        img_array,
        verbose=0
    )[0]

    # --------------------------------------------------------
    # Best crop
    # --------------------------------------------------------

    best_index = int(
        np.argmax(predictions)
    )

    crop = class_names[
        best_index
    ]

    confidence = float(
        predictions[best_index]
    )

    # --------------------------------------------------------
    # Confidence status
    # --------------------------------------------------------

    if confidence >= CROP_HIGH_CONFIDENCE:

        status = "HIGH_CONFIDENCE"

    elif confidence >= CROP_MEDIUM_CONFIDENCE:

        status = "MEDIUM_CONFIDENCE"

    else:

        status = "LOW_CONFIDENCE"

    # --------------------------------------------------------
    # Top 5
    # --------------------------------------------------------

    top_indices = np.argsort(
        predictions
    )[::-1][:5]

    top_predictions = []

    for index in top_indices:

        index = int(index)

        top_predictions.append({

            "crop":
                class_names[index],

            "confidence":
                float(predictions[index])

        })

    return {

        "crop":
            crop,

        "confidence":
            confidence,

        "status":
            status,

        "top_predictions":
            top_predictions

    }


# ============================================================
# FILTER DISEASE CLASSES FOR CROP
# ============================================================

def get_crop_disease_indices(
    crop,
    class_names
):

    if crop not in CROP_PREFIXES:

        return []

    prefix = CROP_PREFIXES[
        crop
    ]

    indices = []

    for index, class_name in enumerate(
        class_names
    ):

        if class_name.startswith(
            prefix
        ):

            indices.append(index)

    return indices


# ============================================================
# DISEASE RECOGNITION
# ============================================================

def recognize_disease(
    image_path,
    crop
):

    # --------------------------------------------------------
    # Load single multicrop model
    # --------------------------------------------------------

    (
        model,
        classes,
        metadata
    ) = load_disease_model()

    # --------------------------------------------------------
    # Find disease classes for crop
    # --------------------------------------------------------

    crop_indices = (
        get_crop_disease_indices(
            crop,
            classes
        )
    )

    # --------------------------------------------------------
    # Safety check
    # --------------------------------------------------------

    if not crop_indices:

        raise ValueError(
            "\n"
            "==================================================\n"
            "NO DISEASE CLASSES FOUND FOR CROP\n"
            "==================================================\n"
            f"Crop : {crop}\n"
            f"Available classes : {len(classes)}\n"
        )

    # --------------------------------------------------------
    # Prepare image
    # --------------------------------------------------------

    img_array = prepare_image(
        image_path
    )

    # --------------------------------------------------------
    # Run multicrop model
    # --------------------------------------------------------

    predictions = model.predict(
        img_array,
        verbose=0
    )[0]

    # --------------------------------------------------------
    # Safety check
    # --------------------------------------------------------

    if len(predictions) != len(classes):

        raise ValueError(
            "\n"
            "==================================================\n"
            "DISEASE PREDICTION ERROR\n"
            "==================================================\n"
            f"Model outputs : {len(predictions)}\n"
            f"Class names   : {len(classes)}\n"
        )

    # ========================================================
    # IMPORTANT
    #
    # ONLY CONSIDER DISEASE CLASSES BELONGING TO DETECTED CROP
    # ========================================================

    crop_predictions = []

    for index in crop_indices:

        crop_predictions.append({

            "index":
                index,

            "class_name":
                classes[index],

            "disease":
                clean_disease_name(
                    classes[index]
                ),

            "confidence":
                float(predictions[index])

        })

    # --------------------------------------------------------
    # Sort by confidence
    # --------------------------------------------------------

    crop_predictions.sort(
        key=lambda x: x["confidence"],
        reverse=True
    )

    # --------------------------------------------------------
    # Best disease
    # --------------------------------------------------------

    best = crop_predictions[0]

    disease = best["disease"]

    confidence = best["confidence"]

    # --------------------------------------------------------
    # Determine healthy
    # --------------------------------------------------------

    if disease.lower() == "healthy":

        status = "healthy"

    else:

        status = "disease_detected"

    # --------------------------------------------------------
    # Confidence status
    # --------------------------------------------------------

    if confidence >= DISEASE_HIGH_CONFIDENCE:

        confidence_status = (
            "HIGH_CONFIDENCE"
        )

    elif confidence >= DISEASE_MEDIUM_CONFIDENCE:

        confidence_status = (
            "MEDIUM_CONFIDENCE"
        )

    else:

        confidence_status = (
            "LOW_CONFIDENCE"
        )

    # --------------------------------------------------------
    # Top 5 crop-specific predictions
    # --------------------------------------------------------

    top_predictions = []

    for prediction in crop_predictions[:5]:

        top_predictions.append({

            "disease":
                prediction["disease"],

            "confidence":
                prediction["confidence"]

        })

    # --------------------------------------------------------
    # Return result
    # --------------------------------------------------------

    return {

        "available":
            True,

        "model":
            "multicrop_disease_model",

        "crop":
            crop,

        "disease":
            disease,

        "confidence":
            confidence,

        "status":
            status,

        "confidence_status":
            confidence_status,

        "top_predictions":
            top_predictions

    }


# ============================================================
# COMPLETE DIAGNOSIS
# ============================================================

def diagnose(
    image_path
):

    image_path = Path(
        image_path
    )

    print("=" * 70)
    print(
        "SMART-FARM ROVER - AI DIAGNOSIS"
    )
    print("=" * 70)

    print("\nIMAGE")
    print("-" * 70)

    print(
        "Input :",
        image_path
    )

    print(
        "Path  :",
        image_path.resolve()
    )

    # ========================================================
    # CROP RECOGNITION
    # ========================================================

    print("\nLoading AI models...")

    crop_result = recognize_crop(
        image_path
    )

    crop = crop_result[
        "crop"
    ]

    # ========================================================
    # DISEASE RECOGNITION
    # ========================================================

    disease_result = recognize_disease(
        image_path,
        crop
    )

    # ========================================================
    # FINAL RESULT
    # ========================================================

    result = {

        "image": {

            "name":
                image_path.name,

            "path":
                str(
                    image_path.resolve()
                )

        },

        "crop": {

            "name":
                crop,

            "confidence":
                crop_result[
                    "confidence"
                ],

            "status":
                crop_result[
                    "status"
                ],

            "top_predictions":
                crop_result[
                    "top_predictions"
                ]

        },

        "disease":
            disease_result

    }

    return result