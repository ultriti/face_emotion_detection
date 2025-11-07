import React, { useRef, useEffect, useState } from "react";
import "./RealtimeFacePrdiction.css";

const BACKEND_URL = "http://localhost:8000/predict_realtime";

export default function RealtimeFacePrdiction() {
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const intervalRef = useRef(null);
  const [predictedEmotion, setpredictedEmotion] = useState("")

  const [running, setRunning] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [bbox, setBbox] = useState(null);
  const [faceThumb, setFaceThumb] = useState(null);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    // request camera permission on mount
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        // prepare capture canvas same size
        const w = videoRef.current.videoWidth || 640;
        const h = videoRef.current.videoHeight || 480;
        if (captureCanvasRef.current) {
          captureCanvasRef.current.width = w;
          captureCanvasRef.current.height = h;
        }
        if (overlayRef.current) {
          overlayRef.current.width = w;
          overlayRef.current.height = h;
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    }
    startCamera();

    return () => {
      // stop camera on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
      }
      stopRealtime();
    };
    // eslint-disable-next-line
  }, []);

  function drawOverlay(box) {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!box) return;
    const [x, y, w, h] = box.map((v) => Math.round(v));
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.font = "16px Inter, Arial";
    if (prediction) {
      const label = typeof prediction === "string" ? prediction : prediction.label || JSON.stringify(prediction);
      ctx.fillText(label, x, Math.max(16, y - 6));
    }
  }

  async function sendFrame() {
    if (!videoRef.current || videoRef.current.readyState < 2) return;
    const start = performance.now();
    const canvas = captureCanvasRef.current;
    const ctx = canvas.getContext("2d");

    // draw scaled frame (you can reduce size here to save bandwidth)
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // get dataURL
    const dataURL = canvas.toDataURL("image/jpeg", 0.7);

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataURL }),
      });
      if (!res.ok) {
        console.error("Backend returned error", res.status);
        return;
      }
      const json = await res.json();
      // expecting { prediction, bbox, face }
      setPrediction(json.prediction ?? null);
      setBbox(json.bbox ?? null);
      setFaceThumb(json.face ?? null);
      drawOverlay(json.bbox ?? null);
    } catch (err) {
      console.error("Network error", err);
    } finally {
      const elapsed = performance.now() - start;
      setFps(Math.round(1000 / Math.max(1, elapsed)));
    }
  }

  function startRealtime(rateMs = 400) {
    if (running) return;
    setRunning(true);
    // ensure capture canvas matches video dims
    const w = videoRef.current.videoWidth || 640;
    const h = videoRef.current.videoHeight || 480;
    captureCanvasRef.current.width = w;
    captureCanvasRef.current.height = h;
    overlayRef.current.width = w;
    overlayRef.current.height = h;

    // send immediately and then every rateMs
    sendFrame();
    intervalRef.current = setInterval(sendFrame, rateMs);
  }

  function stopRealtime() {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setBbox(null);
    // clear overlay
    if (overlayRef.current) {
      const ctx = overlayRef.current.getContext("2d");
      ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    }
  }

  return (
    <div className="realtime-container">
      <nav className="navbar">
        <div className="logo"> AI ML </div>
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/predict_expression">Prediction</a></li>
        </ul>
      </nav>

      <div className="realtimeFrame">

        <div className="video-panel">
          <div className="video-wrap">
            <video ref={videoRef} className="camera-video" autoPlay muted playsInline />
            <canvas ref={overlayRef} className="overlay-canvas" />
          </div>
          <div className="controls">
            <button className="btn" onClick={() => startRealtime(350)} disabled={running}>
              Start
            </button>
            <button className="btn btn-stop" onClick={stopRealtime} disabled={!running}>
              Stop
            </button>
            <div className="meta">FPS ~ {fps} · Sending every 350ms</div>
          </div>
        </div>

        <div className="info-panel">
          <h3>Prediction</h3>
          <div className="prediction-box">
            {prediction ? (
              <pre className="prediction-text">{typeof prediction === "object" ? JSON.stringify(prediction, null, 2) : prediction}</pre>
            ) : (
              <div className="placeholder">No prediction yet</div>
            )}
            <div className="thumb-area">
              {faceThumb ? <img src={faceThumb} alt="face-thumb" /> : <div className="placeholder">No face</div>}
            </div>
          </div>
        </div>
      </div>


      {/* hidden canvas used to capture frames */}
      <canvas ref={captureCanvasRef} style={{ display: "none" }} />
    </div>
  );
}