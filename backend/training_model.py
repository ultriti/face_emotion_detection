import numpy as np
import pandas as pd
import cv2, os, pywt, json, shutil, joblib
import matplotlib.pyplot as plt
import seaborn as sn

from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression

# %% [Cascade Load]
face_cascade = cv2.CascadeClassifier(r"backend\open cv\haarcascade_frontalface_default.xml")

# %% [Wavelet Transform]
def wavelet_transform(img, mode='db1', level=5):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = np.float32(gray) / 255.0
    coeffs = pywt.wavedec2(gray, mode, level=level)
    coeffs[0] *= 0
    img_wave = pywt.waverec2(coeffs, mode)
    return np.uint8(img_wave * 255)

# %% [Face Crop]
def get_face(img_path):
    img = cv2.imread(img_path)
    if img is None: return None
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    for x, y, w, h in faces:
        return img[y:y+h, x:x+w]
    return None

# %% [Data Paths]
path_to_data = "backend/data"
path_to_cropped = "backend/data/Cropped"

if os.path.exists(path_to_cropped):
    shutil.rmtree(path_to_cropped)
os.mkdir(path_to_cropped)

# %% [Crop Faces]
emotion_dirs = [d for d in os.scandir(path_to_data) if d.is_dir()]
cropped_dirs = []
emotion_files = {}

for dir in emotion_dirs:
    emotion = os.path.basename(dir.path)
    emotion_files[emotion] = []
    count = 1
    for entry in os.scandir(dir.path):
        face = get_face(entry.path)
        if face is not None:
            folder = os.path.join(path_to_cropped, emotion)
            if not os.path.exists(folder):
                os.makedirs(folder)
                cropped_dirs.append(folder)
            fname = f"{emotion}_{count}.png"
            fpath = os.path.join(folder, fname)
            cv2.imwrite(fpath, face)
            emotion_files[emotion].append(fpath)
            count += 1

# ----------------> Feature Extraction andwavelet transform
class_dict = {emotion: idx for idx, emotion in enumerate(emotion_files.keys())}
X, Y = [], []

for emotion, files in emotion_files.items():
    for file in files:
        img = cv2.imread(file)
        if img is None: continue
        raw = cv2.resize(img, (48, 48)).reshape(-1, 1)
        wave = wavelet_transform(img)
        wave_resized = cv2.resize(wave, (48, 48)).reshape(-1, 1)
        stacked = np.vstack((raw, wave_resized)).reshape(-1)

        X.append(stacked)
        Y.append(class_dict[emotion])

X = np.array(X).astype(float)
Y = np.array(Y)

# %% [Model Training]
X_train, X_test, y_train, y_test = train_test_split(X, Y, random_state=42)

model_params = {
    "svm": {
        "model": SVC(probability=True),
        "params": {"svc__C": [1, 10], "svc__kernel": ["rbf", "linear"]}
    },
    "rf": {
        "model": RandomForestClassifier(),
        "params": {"randomforestclassifier__n_estimators": [10, 50]}
    },
    "logreg": {
        "model": LogisticRegression(solver='liblinear'),
        "params": {"logisticregression__C": [1, 5]}
    }
}

scores, best_models = [], {}

for name, mp in model_params.items():
    pipe = make_pipeline(StandardScaler(), mp["model"])
    clf = GridSearchCV(pipe, mp["params"], cv=5)
    clf.fit(X_train, y_train)
    scores.append({"model": name, "score": clf.best_score_, "params": clf.best_params_})
    best_models[name] = clf.best_estimator_

df = pd.DataFrame(scores)
print(df)

# %% [Evaluation] of model
best_clf = best_models["svm"]
y_pred = best_clf.predict(X_test)

print(classification_report(y_test, y_pred))

cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(8,6))
sn.heatmap(cm, annot=True, xticklabels=class_dict.keys(), yticklabels=class_dict.keys())
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.show()

# 
# %% [Save Model]
joblib.dump(best_clf, "emotion_model.pkl")
with open(r"backend/emotion_classes.json", "w") as f:
    json.dump(class_dict, f)
