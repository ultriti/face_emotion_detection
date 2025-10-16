import os
import cv2
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import classification_report

# 📁 Load images from multiple emotion folders
def load_dataset(base_path, emotions):
    images = []
    labels = []
    valid_exts = [".jpg", ".jpeg", ".png", ".bmp"]

    for emotion in emotions:
        folder_path = os.path.join(base_path, emotion)
        if not os.path.isdir(folder_path):
            print(f"⚠️ Skipping missing folder: {folder_path}")
            continue

        for filename in os.listdir(folder_path):
            if not any(filename.lower().endswith(ext) for ext in valid_exts):
                continue
            img_path = os.path.join(folder_path, filename)
            img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
            if img is None:
                print(f"⚠️ Couldn't read: {img_path}")
                continue
            img = cv2.resize(img, (48, 48))
            images.append(img.flatten())
            labels.append(emotion)
    return images, labels

# 📦 Define dataset path and emotion categories
base_path = r"E:\python\ml projects\face feeling detection\data"
emotions = ["happy", "sad", "angry", "surprise"]

# 🧠 Load and encode data
img, lbl = load_dataset(base_path, emotions)
le = LabelEncoder()
y_encoded = le.fit_transform(lbl)

# 🧪 Split into training and test sets
X_train, X_test, y_train, y_test = train_test_split(img, y_encoded, test_size=0.2, random_state=42)

# 🚀 Train the model
model = SVC(kernel='linear')
model.fit(X_train, y_train)

# 📊 Evaluate performance
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred, target_names=le.classes_))

# 🔮 Predict emotion from a new image
def predict_emotion(img_path):
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError(f"Image not found or unreadable: {img_path}")
    img = cv2.resize(img, (48, 48)).flatten().reshape(1, -1)
    pred = model.predict(img)
    return le.inverse_transform(pred)[0]

# 🧪 Example usage
# result = predict_emotion(r"E:\python\ml projects\face feeling detection\test\img1.jpg")
# print("Predicted emotion:", result)
