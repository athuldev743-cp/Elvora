import React from 'react';
import './PolicyPages.css';

const ContactPage = () => {
  return (
    <div className="policy-page">
      <div className="policy-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We're here to help — reach out anytime</p>
        </div>
      </div>

      <div className="policy-container">
        <p className="policy-intro">
          Have a question about your order, our products, or anything else? We'd love to hear from you.
          Get in touch through any of the channels below.
        </p>

        <div className="contact-cards">
          <div className="contact-card">
            <div className="contact-card-icon">📧</div>
            <h3>Email</h3>
            <p><a href="mailto:contact.elvorafoods@gmail.com">contact.elvorafoods@gmail.com</a></p>
            <span>We reply within 24–48 working hours</span>
          </div>
          <div className="contact-card">
            <div className="contact-card-icon">📞</div>
            <h3>Phone</h3>
            <p><a href="tel:+918089329474">+91 8089329474</a></p>
            <span>Mon–Sat, 9 AM – 6 PM IST</span>
          </div>
          <div className="contact-card">
            <div className="contact-card-icon">💬</div>
            <h3>WhatsApp</h3>
            <p><a href="https://wa.me/918089329474" target="_blank" rel="noopener noreferrer">+91 8089329474</a></p>
            <span>Quick queries & order support</span>
          </div>
          <div className="contact-card">
            <div className="contact-card-icon">📍</div>
            <h3>Address</h3>
            <p>Elvora Foods</p>
            <span>Kaloor, Kochi, Kerala, India</span>
          </div>
        </div>

        <section className="policy-section">
          <h2>📅 Support Hours</h2>
          <div className="policy-table-wrap">
            <table>
              <tbody>
                <tr><td><strong>Monday – Friday</strong></td><td>9:00 AM – 6:00 PM IST</td></tr>
                <tr><td><strong>Saturday</strong></td><td>10:00 AM – 4:00 PM IST</td></tr>
                <tr><td><strong>Sunday</strong></td><td>Closed</td></tr>
                <tr><td><strong>Public Holidays</strong></td><td>Closed (replies next business day)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="policy-highlight" style={{ marginTop: '24px' }}>
          💡 <strong>For order-related issues,</strong> please keep your <strong>Order ID</strong> handy
          when contacting us — it helps us resolve your query faster.
        </div>
      </div>
    </div>
  );
};

export default ContactPage;