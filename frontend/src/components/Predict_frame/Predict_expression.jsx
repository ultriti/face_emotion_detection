import React, { useState } from 'react';
import axios from 'axios';
import './predict_expression.css';

function Predict_expression() {
  const [imageFile, setImageFile] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [dataPredicted, setdataPredicted] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [predicting_load, setpredicting_load] = useState(false);

  const handleFile = (file) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert('Please select an image');
    setpredicting_load(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataURL = reader.result;
      const data = { dataURL };

      console.log("url:",data)

      try {
        const response = await axios.post('http://localhost:8000/classify_image', data, {
          withCredentials: true,
        });
        setpredicting_load(false);

        const rawData = response.data?.Data?.[0];
        const classProbs = rawData?.class_probability || [];
        console.log('0--->',response.data);
        

        let maxProb = null;
        let maxIndex = null;

        if (Array.isArray(classProbs)) {
          maxProb = Math.max(...classProbs);
          maxIndex = classProbs.indexOf(maxProb);
        }

        const responseData_ = {
          name: rawData?.class || null,
          probability: classProbs,
          maxProbability: {
            value: maxProb,
            index: maxIndex
          }
        };

        setdataPredicted(responseData_);
        setResponseData(JSON.stringify(response.data, null, 2));
      } catch (error) {
        console.error('Upload failed:', error);
        setpredicting_load(false);
      }
    };

    reader.readAsDataURL(imageFile);
  };

  return (
    <div className="predict_face_frame">
      <nav className="navbar">
        <div className="logo"> AI ML </div>
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
        </ul>
      </nav>

      <div className="Predict_frame_cont">
        <h2>Upload Image for Classification</h2>

        <form onSubmit={handleSubmit}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <div
            className={`drop_zone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <p>Drag & Drop your image here or click to select</p>
          </div>
          <button type="submit">Submit</button>
        </form>

        {predicting_load && (
          <div className="loader-container">
            <div className="loader"></div>
            <p className="loader-text">Predicting...</p>
          </div>
        )}

        {preview && (
          <div className="preview_frame">
            <h3>Preview:</h3>
            <img src={preview} alt="Preview" />
          </div>
        )}

        {dataPredicted && (
          <div className="response_Frame">
            <h3>Result:</h3>
            <h2>Name: {dataPredicted.name || 'Image cannot be detected'}</h2>
            {dataPredicted.maxProbability?.value !== null && (
              <h2>
                Max Probability: {dataPredicted.maxProbability.value}% (Class {dataPredicted.maxProbability.index + 1})
              </h2>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Predict_expression;
