import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BiBookAlt, 
  BiGroup, 
  BiShareAlt, 
  BiStar,
  BiBook,
  BiUser,
  BiChat,
  BiUserPlus,
  BiUserVoice,BiEnvelope, BiPhone, BiMap
} from 'react-icons/bi';
import './Homepage.css';

const Homepage = () => {
  useEffect(() => {
    document.title = "SCAN";
  }, []);

  return (
    <div className="homepage-container">
      {/* Hero Section with Icon Illustration */}
      <section className="hero-section">
  <div className="hero-content">
    <h1>Connect, Share & Grow <span>Together</span></h1>
    <p className="hero-subtitle">
      <strong style={{fontStyle: 'italic'}}>SCAN</strong> helps you share resources, connect with peers, and collaborate on projects across your college community.
    </p>
    <div className="hero-buttons">
  <Link 
    to="/" 
    className="primary-button"
    onClick={(e) => {
      e.preventDefault();
      const element = document.getElementById('start');
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'  // aligns top of element with top of viewport
        });
      }
    }}
  >
    Get Started
  </Link>
</div>
  </div>
  <div className="hero-image">
    <div className="icon-composition">
      <div className="main-icons">
        <BiBook className="icon book-icon" />
        <BiShareAlt className="icon share-icon" />
      </div>
      <div className="user-icons">
        <BiUser className="icon user-icon" />
        <BiUserPlus className="icon user-plus-icon" />
        <BiUserVoice className="icon user-voice-icon" />
      </div>
      <div className="connection-line"></div>
    </div>
  </div>
</section>

      {/* Rest of your existing sections remain exactly the same */}
      {/* Features Section */}
      <section className="features-section" id="about">
        <h2>Why Choose SCAN?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <BiBookAlt className="feature-icon" />
            <h3>Resource Sharing</h3>
            <p>Access and share notes, books, and study materials with your batchmates and seniors.</p>
          </div>
          <div className="feature-card">
            <BiGroup className="feature-icon" />
            <h3>Peer Network</h3>
            <p>Connect with students across branches and batches to exchange ideas and knowledge.</p>
          </div>
          <div className="feature-card">
            <BiShareAlt className="feature-icon" />
            <h3>Project Collaboration</h3>
            <p>Find teammates and work together on academic projects and open-source initiatives.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" id="start">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Sign Up</h3>
            <p>Create your account using your college email</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Explore Resources</h3>
            <p>Browse or upload study materials by branch and semester</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Connect & Collaborate</h3>
            <p>Network with peers and work on projects together</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <h2>What Students Say</h2>
        <div className="testimonial-cards">
          <div className="testimonial-card">
            <BiStar className="testimonial-rating" />
            <p>"Found all my semester notes here, saved so much time!"</p>
            <div className="testimonial-author">- CS Senior</div>
          </div>
          <div className="testimonial-card">
            <BiStar className="testimonial-rating" />
            <p>"Met my project team through SCAN. Best platform!"</p>
            <div className="testimonial-author">- ECE Junior</div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <footer className="footer-section" id="contact">
  <div className="footer-content">
    <h1>SCAN</h1>
    <h3 style={{ fontStyle: 'italic' }}>Connect, Share & Grow Together</h3>
  </div>
  <div className="contact-info">
    <div className="contact-item">
      <BiEnvelope className="contact-icon" />
      <span>scan@gmail.com</span>
    </div>
    <div className="contact-item">
      <BiPhone className="contact-icon" />
      <span>+91 9876543210</span>
    </div>
    <div className="contact-item">
      <BiMap className="contact-icon" />
      <span>UVCE, Bengaluru</span>
    </div>
  </div>
  {/* Additional footer content can go here */}
  <div className="footer-links">
    <Link 
    to="/" 
    onClick={(e) => {
      e.preventDefault();
      const element = document.getElementById('about');
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'  // aligns top of element with top of viewport
        });
      }
    }}
  >
    About
  </Link>
    <Link to="/privacy">Privacy Policy</Link>
    <Link to="/terms">Terms of Service</Link>
  </div>
  
  <div className="copyright">
    © {new Date().getFullYear()} SCAN. All rights reserved.
  </div>
</footer>
    </div>
  );
};

export default Homepage;