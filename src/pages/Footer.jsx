import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const socialLinks = [
    { id: 1, name: 'Facebook',  icon: 'fab fa-facebook-f', url: 'https://www.facebook.com/ekabhumih' },
    { id: 2, name: 'Twitter',   icon: 'fab fa-twitter',    url: 'https://twitter.com/ekabhumih' },
    { id: 3, name: 'Instagram', icon: 'fab fa-instagram',  url: 'https://www.instagram.com/ekabhumih' },
  ];

  const policyLinks = [
    { label: 'Terms & Conditions',       path: '/terms-and-conditions' },
    { label: 'Refund & Cancellation',    path: '/refund-policy' },
    { label: 'Shipping & Delivery',      path: '/shipping-policy' },
    { label: 'Contact Us',               path: '/contact' },
  ];

  return (
    <footer id="footer" className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">

            {/* Column 1: Brand */}
            <div className="footer-column">
              <div className="footer-logo">
                <span className="brand">
                  <span className="brand-name">🌿 Elvora</span>
                </span>
              </div>
              <p className="footer-tagline">
                Pure, natural and hygienically processed nutrition — straight from Kerala's finest Nendran bananas.
              </p>
            </div>

            {/* Column 2: Quick Links / Policies */}
            <div className="footer-column">
              <h3 className="footer-title">Policies</h3>
              <ul className="footer-links-list">
                {policyLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact & Social */}
            <div className="footer-column">
              <h3 className="footer-title">Contact Info</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Kaloor, Kochi, Kerala</span>
                </div>
                <div className="contact-item">
                  <i className="fas fa-phone"></i>
                  <a href="tel:+918089329474">+91 8089329474</a>
                </div>
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <a href="mailto:contact.elvorafoods@gmail.com">contact.elvorafoods@gmail.com</a>
                </div>
              </div>

              <h3 className="footer-title" style={{ marginTop: '20px' }}>Follow Us</h3>
              <div className="social-links">
                {socialLinks.map(social => (
                  <a
                    key={social.id}
                    href={social.url}
                    className="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    title={social.name}
                  >
                    <i className={social.icon}></i>
                  </a>
                ))}
              </div>

              <div className="newsletter">
                <h4>Newsletter</h4>
                <p>Subscribe for updates and offers</p>
                <div className="newsletter-form">
                  <input type="email" placeholder="Your email address" />
                  <button type="submit" aria-label="Subscribe">
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {new Date().getFullYear()} ELVORA. All Rights Reserved.&nbsp;
              <Link to="/terms-and-conditions">Terms of Use</Link> &nbsp;|&nbsp;
              <Link to="/refund-policy">Refund Policy</Link> &nbsp;|&nbsp;
              <Link to="/shipping-policy">Shipping Policy</Link> &nbsp;|&nbsp;
              <Link to="/contact">Contact</Link>
            </p>
            <div className="payment-methods">
              <i className="fab fa-cc-visa"></i>
              <i className="fab fa-cc-mastercard"></i>
              <i className="fab fa-cc-paypal"></i>
              <i className="fab fa-cc-apple-pay"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;