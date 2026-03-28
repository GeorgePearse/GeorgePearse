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
          <div className="about-header">
            <div className="section-header">
              <h1>George Pearse</h1>
              <p className="subtitle">Machine Learning Engineer</p>
            </div>
            <a className="about-header__cta" href="#notes">
              Notes
            </a>
          </div>
          <p>
            This site is a working index of projects, notes, and experiments. Most of the work here
            starts as a way to learn something properly by building it.
          </p>
          <p>
            I&apos;ve worked across computer vision, data engineering, and MLOps, and I currently
            lead machine learning engineering at {joined}.
          </p>
        </div>
      </div>
    </section>
  );
};
