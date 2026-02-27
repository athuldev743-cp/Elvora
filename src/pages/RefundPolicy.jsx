import React from 'react';
import './PolicyPages.css';

const RefundPolicy = () => {
  return (
    <div className="policy-page">
      <div className="policy-hero">
        <div className="container">
          <h1>Refund & Cancellation Policy</h1>
          <p>Last Updated: February 2025</p>
        </div>
      </div>

      <div className="policy-container">
        <div className="policy-highlight">
          ✅ We offer a <strong>hassle-free refund or replacement</strong> for eligible cases. Our goal is to
          make sure you're happy with your purchase.
        </div>

        <section className="policy-section">
          <h2>1. Cancellation Policy</h2>
          <ul>
            <li>Orders can be cancelled within <strong>24 hours of placing the order</strong>, provided the order has not been dispatched.</li>
            <li>To cancel, email us at <strong>contact.elvorafoods@gmail.com</strong> or call us with your Order ID.</li>
            <li>Once dispatched, cancellation is not possible. You may apply for a return after delivery instead.</li>
            <li>Orders cancelled within the eligible window will receive a full refund within 5–7 business days.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>2. Return Eligibility</h2>
          <p>You can request a return within <strong>7 days of delivery</strong> if:</p>
          <ul>
            <li>The product received is damaged or broken during transit.</li>
            <li>The wrong product or quantity was delivered.</li>
            <li>The product is expired or has a manufacturing defect.</li>
            <li>The packaging is tampered with or seal is broken upon arrival.</li>
          </ul>
          <p className="note-text">Returns will <strong>NOT</strong> be accepted for:</p>
          <ul>
            <li>Products that have been opened and partially used (except quality complaints).</li>
            <li>Change of mind after delivery.</li>
            <li>Products stored improperly after delivery.</li>
            <li>Requests raised after 7 days of delivery.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. How to Raise a Return / Refund Request</h2>
          <ul>
            <li>Email us at <strong>contact.elvorafoods@gmail.com</strong> with your Order ID, a brief description of the issue, and clear photographs of the product and packaging.</li>
            <li>Our team will review your request within <strong>48 working hours</strong>.</li>
            <li>If approved, we will arrange a pickup or request you to self-ship the item back to us.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Refund Process</h2>
          <div className="policy-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Payment Method</th>
                  <th>Refund Timeline</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>UPI / Net Banking</td><td>3–5 business days</td></tr>
                <tr><td>Debit / Credit Card</td><td>5–7 business days</td></tr>
                <tr><td>Cash on Delivery</td><td>Bank transfer within 7 business days (NEFT)</td></tr>
              </tbody>
            </table>
          </div>
          <p>Refunds are processed to the original payment method only.</p>
        </section>

        <section className="policy-section">
          <h2>5. Replacement Option</h2>
          <p>
            If you prefer a replacement over a refund (for damaged or wrong product cases), we will dispatch a
            fresh unit at no extra charge, subject to stock availability.
          </p>
        </section>

        <section className="policy-section">
          <h2>6. Contact Us</h2>
          <div className="contact-block">
            <p>📧 <a href="mailto:contact.elvorafoods@gmail.com">contact.elvorafoods@gmail.com</a></p>
            <p>📞 +91 8089329474 (Mon–Sat, 9 AM – 6 PM)</p>
            <p>📍 Kaloor, Kochi, Kerala, India</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RefundPolicy;