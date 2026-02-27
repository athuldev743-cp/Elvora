import React from 'react';
import './PolicyPages.css';

const TermsAndConditions = () => {
  return (
    <div className="policy-page">
      <div className="policy-hero">
        <div className="container">
          <h1>Terms and Conditions</h1>
          <p>Last Updated: February 2025</p>
        </div>
      </div>

      <div className="policy-container">
        <p className="policy-intro">
          Welcome to Elvora. By accessing our website or purchasing our products, you agree to be bound by the
          following Terms and Conditions. Please read them carefully before proceeding.
        </p>

        <section className="policy-section">
          <h2>1. About Us</h2>
          <p>
            Elvora is a food and wellness brand offering natural, hygienically processed products including our
            flagship product — <strong>Ripe Nendran Banana Powder</strong>. We are committed to delivering
            authentic, quality nutrition to our customers across India.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Eligibility</h2>
          <p>
            By placing an order, you confirm that you are at least 18 years of age and legally capable of
            entering into a binding contract. Orders placed on behalf of a minor must be done by a parent or
            legal guardian.
          </p>
        </section>

        <section className="policy-section">
          <h2>3. Product Information</h2>
          <ul>
            <li>All product descriptions, ingredient lists, and nutritional information are provided in good faith and are as accurate as possible.</li>
            <li>Product images are for representation purposes. Actual product color or packaging may vary slightly due to natural ingredients or printing differences.</li>
            <li>Elvora Ripe Nendran Banana Powder is a food supplement and is not intended to diagnose, treat, cure, or prevent any disease. Consult a physician if you have a medical condition.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Pricing and Payments</h2>
          <ul>
            <li>All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.</li>
            <li>We reserve the right to modify prices at any time without prior notice.</li>
            <li>Payments are processed securely through our payment partner. We do not store card or banking information.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>5. Order Acceptance</h2>
          <p>
            Placing an order does not constitute a binding contract until we confirm acceptance via email or SMS.
            We reserve the right to refuse or cancel any order in case of pricing errors, product unavailability,
            or suspected fraudulent activity.
          </p>
        </section>

        <section className="policy-section">
          <h2>6. Intellectual Property</h2>
          <p>
            All content on this website including text, graphics, logos, and product images are the property of
            Elvora and are protected under applicable intellectual property laws. Unauthorized use, reproduction,
            or distribution is strictly prohibited.
          </p>
        </section>

        <section className="policy-section">
          <h2>7. Limitation of Liability</h2>
          <p>
            Elvora shall not be liable for any indirect, incidental, or consequential damages arising out of the
            use or inability to use our products or services. Our maximum liability shall not exceed the purchase
            price of the product in question.
          </p>
        </section>

        <section className="policy-section">
          <h2>8. Governing Law</h2>
          <p>
            These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive
            jurisdiction of courts in Kerala, India.
          </p>
        </section>

        <section className="policy-section">
          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right to update these Terms at any time. Continued use of our website after changes
            constitutes your acceptance of the revised Terms.
          </p>
        </section>

        <section className="policy-section">
          <h2>10. Contact Us</h2>
          <div className="contact-block">
            <p>📧 <a href="mailto:contact.elvorafoods@gmail.com">contact.elvorafoods@gmail.com</a></p>
            <p>📞 +91 8089329474</p>
            <p>📍 Kaloor, Kochi, Kerala, India</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditions;