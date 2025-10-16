from flask import Flask,render_template,request,redirect,url_for,session,flash,jsonify
from flask_wtf.csrf import CSRFProtect
from flask_cors import CORS
import util
import os
import base64
import imghdr

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


if __name__ == "__main__":
    util.Load_Saved_Artifacts()
    app.run(debug=True,port = 8000)
