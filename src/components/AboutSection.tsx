const joined = "BinIt";

export const AboutSection = () => {
  return (
    <section className="section about-section">
      <div className="section-header">
        <h1>George Pearse</h1>
        <p className="subtitle">Machine Learning Engineer · Builder · Writer</p>
      </div>
      <p>
        I use this space as a living notebook while I study new areas of technology. My fastest
        route to learning anything has always been to build, test the edges, and document the sharp
        bits along the way. Each project card captures one of those explorations.
      </p>
      <p>
        I&apos;ve previously contributed to computer vision, data engineering, and MLOps products, and
        I am currently building as the Lead ML Engineer at {joined}. When things get tricky, that&apos;s a
        sign I&apos;m about to learn something useful—so I lean in.
      </p>
    </section>
  );
};
