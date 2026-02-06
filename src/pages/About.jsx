import React from "react";
import "./About.css";

export default function About() {
  return (
    <section className="about-page" aria-label="About">
      <img
        src="/images/about.jpg"
        alt="About Elvora"
        className="about-img"
        loading="lazy"
      />
    </section>
  );
}