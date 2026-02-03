import React from "react";
import "./About.css";

const About = () => {
  return (
    <section className="about-page" aria-label="About">
      <img
        src={`${process.env.PUBLIC_URL}/images/about.jpg`}
        alt="About Elvora"
        className="about-img"
        loading="lazy"
      />
    </section>
  );
};

export default About;
