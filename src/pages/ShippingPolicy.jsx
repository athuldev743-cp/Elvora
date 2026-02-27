import React from 'react';
import './PolicyPages.css';

const ShippingPolicy = () => {
  return (
    <div className="policy-page">
      <div className="policy-hero">
        <div className="container">
          <h1>Shipping & Delivery Policy</h1>
          <p>Last Updated: February 2025</p>
        </div>
      </div>

      <div className="policy-container">
        <div className="shipping-steps">
          <div className="shipping-step">
            <div className="step-icon">🛒</div>
            <div className="step-label">Order Placed</div>
            <div className="step-desc">Confirmation SMS/email sent</div>
          </div>
          <div className="step-arrow">→</div>
          <div className="shipping-step">
            <div className="step-icon">📦</div>
            <div className="step-label">Packed</div>
            <div className="step-desc">Hygienically packed within 24 hrs</div>
          </div>
          <div className="step-arrow">→</div>
          <div className="shipping-step">
            <div className="step-icon">🚚</div>
            <div className="step-label">Dispatched</div>
            <div className="step-desc">Shipped via trusted courier</div>
          </div>
          <div className="step-arrow">→</div>
          <div className="shipping-step">
            <div className="step-icon">🏠</div>
            <div className="step-label">Delivered</div>
            <div className="step-desc">Right to your doorstep</div>
          </div>
        </div>

        <section className="policy-section">
          <h2>1. Order Processing Time</h2>
          <ul>
            <li>Orders are processed within <strong>1–2 business days</strong> after payment confirmation.</li>
            <li>Orders placed on Sundays or public holidays will be processed the next business day.</li>
            <li>You will receive a confirmation email/SMS with tracking details once dispatched.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>2. Delivery Timelines</h2>
          <div className="policy-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Estimated Delivery</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Kerala (same state)</td><td>1–3 business days</td></tr>
                <tr><td>South India (TN, KA, AP, TG)</td><td>2–4 business days</td></tr>
                <tr><td>Metro cities (Mumbai, Delhi, Bengaluru, etc.)</td><td>3–5 business days</td></tr>
                <tr><td>Rest of India</td><td>4–7 business days</td></tr>
                <tr><td>Remote / North-East India</td><td>7–10 business days</td></tr>
              </tbody>
            </table>
          </div>
          <p>Delivery timelines are estimates and may vary due to courier delays, weather, or public holidays.</p>
        </section>

        <section className="policy-section">
          <h2>3. Shipping Charges</h2>
          <ul>
            <li><strong>Free shipping</strong> on orders above ₹499.</li>
            <li>Orders below ₹499 attract a flat shipping fee of ₹50.</li>
            <li>For bulk/wholesale orders, shipping is calculated at checkout.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Packaging</h2>
          <p>
            All Elvora products are securely packed to prevent damage during transit. The Ripe Nendran Banana
            Powder is sealed in moisture-proof packaging and then placed in a protective outer box with bubble
            wrap for extra safety.
          </p>
        </section>

        <section className="policy-section">
          <h2>5. Tracking Your Order</h2>
          <ul>
            <li>Once dispatched, you will receive a tracking number via SMS and email.</li>
            <li>You can track your order on our courier partner's website using this number.</li>
            <li>For tracking assistance, contact us at contact.elvorafoods@gmail.com with your Order ID.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>6. Undeliverable Packages</h2>
          <ul>
            <li>If delivery fails due to incorrect address or unavailability after 2 attempts, the package will be returned to us.</li>
            <li>We will contact you to reship at an additional delivery charge.</li>
            <li>Please ensure your delivery address and phone number are accurate at the time of ordering.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>7. Damaged in Transit</h2>
          <p>
            If your order arrives damaged, take photos immediately and email us at{' '}
            <strong>contact.elvorafoods@gmail.com</strong> within 48 hours of delivery. We will arrange a
            replacement or refund promptly.
          </p>
        </section>

        <section className="policy-section">
          <h2>8. Contact Us</h2>
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

export default ShippingPolicy;