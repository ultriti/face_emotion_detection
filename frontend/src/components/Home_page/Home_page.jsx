import React from 'react';
import './Home_page.css';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Face Recognition Classifier',
      subtitle: 'Powered by AI & ML',
      description:
        'Upload an image and let our intelligent classifier instantly identify the face of a known athlete or public figure. Built for sports directories, fan apps, and media workflows—fast, accurate, and real-world ready.',
      route: '/predict_expression',
    },
    {
      title: 'Real-Time Emotion Detection',
      subtitle: 'Instant Insights from Facial Cues',
      description:
        'Analyze facial expressions in real time to detect emotions with precision. Ideal for live sports coverage, fan engagement platforms, and interactive media experiences.',
      route: '/Realtime_predict',
    },
  ];

  return (
    <div className="home-page">
      <header className="navbar">
        <div className="brand-logo">AI ML</div>
        <ul className="nav-menu">
          <li>Home</li>
          <li>About</li>
          <li>Contact</li>
        </ul>
      </header>

      {sections.map((section, index) => (
        <section className="hero-section" key={index}>
          <div className="hero-content">
            <h1 className="fade-in">{section.title}</h1>
            {section.subtitle && <h2 className="slide-up">{section.subtitle}</h2>}
            <p className="fade-in-delay">{section.description}</p>
            <button className="cta-button" onClick={() => navigate(section.route)}>
              Launch Prediction
            </button>
          </div>
        </section>
      ))}
    </div>
  );
};

export default HomePage;
