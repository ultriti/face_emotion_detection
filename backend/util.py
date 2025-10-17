import cv2
import numpy as np
import base64
import json
import joblib
from Wavelet import w2D  # Ensure this matches your wavelet module

# Globals
__class_Number_to_name = {}
__class_name_to_number = {}
__model = None

# Emotion classification
def classify_image(image_base64_data=None, file_path=None):
    imgs = get_cropped_image_if_2_eyes(file_path, image_base64_data)
    result = []

    print(imgs)
    
    if not imgs:
        print("No valid face with 2 eyes detected.")
        return [{"error": "No valid face with 2 eyes detected"}]

    for img in imgs:
        resized_img = cv2.resize(img, (48, 48))
        wavelet_img = w2D(resized_img, "db1", 5)
        wavelet_resized = cv2.resize(wavelet_img, (48, 48))

        raw_flat = resized_img.reshape(48 * 48 * 3, 1)
        wave_flat = wavelet_resized.reshape(48 * 48, 1)

        combined = np.vstack((raw_flat, wave_flat)).reshape(1, -1).astype(float)

        prediction = int(__model.predict(combined)[0])
        probabilities = np.around(__model.predict_proba(combined) * 100, 2).tolist()[0]

        result.append({
            'class': Class_num_to_name(prediction),
            'class_probability': probabilities,
            'class_dictionary': __class_name_to_number
        })

    return result

# Load model and class dictionary
def Load_Saved_Artifacts():
    global __class_name_to_number, __class_Number_to_name, __model

    with open(r"backend\emotion_classes.json", "r") as f:
        __class_name_to_number = json.load(f)
        __class_Number_to_name = {v: k for k, v in __class_name_to_number.items()}

    
    if __model is None:
        __model = joblib.load(r"backend\emotion_model.pkl")
  

    print("Artifacts loaded successfully.")

# Convert base64 to OpenCV image
def get_cv2_image_from_base64_string(b64str):
    try:
        encoded_data = b64str.split(',')[1]
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception as e:
        print("Error decoding base64 image:", e)
        return None

# Crop face with at least 2 eyes
def get_cropped_image_if_2_eyes(image_path=None, image_base64_data=None):
    face_cascade = cv2.CascadeClassifier(r"backend\open cv\haarcascade_frontalface_default.xml")
    eye_cascade = cv2.CascadeClassifier(r"backend\open cv/haarcascade_eye.xml")

    print("data:url:-",image_path)
    img = cv2.imread(image_path) if image_path else get_cv2_image_from_base64_string(image_base64_data)
    if img is None:
        
        
        
        print("Error loading image.")
        return []

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    cropped_faces = []
    for x, y, w, h in faces:
        roi_gray = gray[y:y+h, x:x+w]
        roi_color = img[y:y+h, x:x+w]
        eyes = eye_cascade.detectMultiScale(roi_gray)
        if len(eyes) >= 2:
            cropped_faces.append(roi_color)

    return cropped_faces

# Utility
def Class_num_to_name(class_num):
    return __class_Number_to_name.get(class_num, "Unknown")

def get_base_64_for_virat():
    with open("base64.txt", "r") as f:
        return f.read()

# Run test
if __name__ == "__main__":
    Load_Saved_Artifacts()
    test_images = [
        "backend\test_data\moosa_pic.jpg"
    ]
    for img_path in test_images:
        print(classify_image(file_path=img_path))
