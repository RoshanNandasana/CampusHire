import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>CampusHire</h4>
          <p>AI-Driven Campus Placement Preparation & Management System</p>
        </div>

        <div className="footer-section">
          <h5>Quick Links</h5>
          <ul>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h5>Support</h5>
          <ul>
            <li><a href="mailto:support@campushire.com">Email Support</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#documentation">Documentation</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h5>Connect</h5>
          <div className="social-links">
            <a href="#facebook" aria-label="Facebook">f</a>
            <a href="#twitter" aria-label="Twitter">𝕏</a>
            <a href="#linkedin" aria-label="LinkedIn">in</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} CampusHire. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
