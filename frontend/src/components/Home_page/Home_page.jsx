import React from 'react';
import './Home_page.css';
import { useNavigate } from 'react-router-dom';

const Home_page = () => {
  const nav = useNavigate();

  return (
    <div className="homepage">
      <nav className="navbar">
        <div className="logo"> AI ML</div>
        <ul className="nav-links">
          <li>Home</li>
          <li>About</li>
          <li>Contact</li>
        </ul>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1 className="fade-in">Face Recognition Classifier</h1>
          <h2 className="slide-up">Powered by AI & ML</h2>
          <p className="fade-in-delay">
            Upload an image and let our intelligent classifier instantly identify the face of a known athlete or public figure. 
            Built for sports directories, fan apps, and media workflows—fast, accurate, and real-world ready.
          </p>
          <button className="cta-btn" onClick={() => nav('/predict_expression')}>
            Launch Prediction
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home_page;
