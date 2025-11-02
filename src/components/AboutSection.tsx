import profilePhoto from "../../assets/profile-photo.jpg";

const joined = (
  <a href="https://visia.ai" target="_blank" rel="noreferrer">
    Visia
  </a>
);

export const AboutSection = () => {
  return (
    <section className="section about-section">
      <div className="about-container">
        <div className="about-photo">
          <img src={profilePhoto} alt="George Pearse" className="profile-image" />
        </div>
        <div className="about-content">
          <div className="section-header">
            <h1>George Pearse</h1>
            <p className="subtitle">Machine Learning Engineer · Builder · Writer</p>
          </div>
          <p>
            I use this space as a living notebook while I study new areas of technology. My fastest
            route to learning anything has always been to build, test the edges, and document the
            sharp bits along the way. Each project card captures one of those explorations.
          </p>
          <p>
            I&apos;ve previously contributed to computer vision, data engineering, and MLOps
            products, and I am currently building as the Lead ML Engineer at {joined}.
          </p>
          <p>
            You can also view my{" "}
            <a href="https://app.astralapp.com/" target="_blank" rel="noreferrer">
              GitHub stars on Astral
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
};
