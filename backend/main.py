from flask import Flask,render_template,request,redirect,url_for,session,flash,jsonify
from flask_wtf.csrf import CSRFProtect
from flask_cors import CORS
import util
import os
import base64
import imghdr
import cv2
import numpy as np


app = Flask(__name__)
CORS(app, supports_credentials=True, origins=['http://localhost:5173','http://localhost:5173/predict_expression'])


# image predictin

@app.route('/classify_image', methods=["POST"])
def Classify_image():
    data = request.get_json()
    image_data_url = data.get('dataURL')
    
    print(image_data_url)

    if not image_data_url:
        return jsonify({"error": "No image data received"}), 400

    result = util.classify_image(image_data_url)

    return jsonify({"Data": result}), 200



# Helper: decode dataURL -> cv2 image
def _dataurl_to_cv2(data_url):
    try:
        header, encoded = data_url.split(',', 1)
    except Exception:
        return None
    data = base64.b64decode(encoded)
    nparr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

# Helper: cv2 image -> dataURL (jpeg)
def _cv2_to_dataurl(img):
    _, buf = cv2.imencode('.jpg', img)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.tobytes()).decode()

# load cascade once (file is relative to this backend folder)
_cascade_path = os.path.join(os.path.dirname(__file__), "open cv", "haarcascade_frontalface_default.xml")
_face_cascade = cv2.CascadeClassifier(_cascade_path)

@app.route('/predict_realtime', methods=['POST'])
def predict_realtime():

    data = request.get_json()
    image_data_url = data.get('dataURL')
    if not image_data_url:
        return jsonify({"error": "No image data received"}), 400

    img = _dataurl_to_cv2(image_data_url)
    if img is None:
        return jsonify({"error": "Invalid image data"}), 400

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = _face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    if len(faces) == 0:
        # no face -> classify whole image
        result = util.classify_image(image_data_url)
        return jsonify({"prediction": result, "bbox": None, "face": None}), 200

    x, y, w, h = faces[0]
    # ensure crop bounds
    x, y, w, h = int(x), int(y), int(w), int(h)
    crop = img[y:y+h, x:x+w]
    crop_dataurl = _cv2_to_dataurl(crop)

    # call your existing classifier on the cropped face
    result = util.classify_image(crop_dataurl)

    return jsonify({
        "prediction": result,
        "bbox": [x, y, w, h],
        "face": crop_dataurl
    }), 200
    
    
    


if __name__ == "__main__":
    util.Load_Saved_Artifacts()
    app.run(debug=True,port = 8000)
