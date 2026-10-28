import profilePhoto from "../assets/profile-photo.jpg";
import { projects } from "./projects";

const links = [
  { label: "GitHub", href: "https://github.com/GeorgePearse" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/georgepearse/" },
  { label: "X", href: "https://x.com/Georgehwp1" },
  { label: "visia.ai", href: "https://visia.ai" },
];

export default function App() {
  return (
    <main className="page">
      <aside className="intro">
        <img className="photo" src={profilePhoto} alt="George Pearse" width={220} height={220} />
        <h1 className="name">George Pearse</h1>
        <p className="role">
          Head of Platform Engineering at <a href="https://visia.ai">Visia</a>
        </p>
        <ul className="links" aria-label="Links">
          {links.map((link) => (
            <li key={link.label}>
              <a className="social-link" href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </aside>
      <section className="projects" aria-label="Projects">
        <ul className="project-list">
          {projects.map((project) => (
            <li key={project.name} className="project">
              <a className="project-link" href={project.url}>
                {project.name}
              </a>
              <p className="project-description">{project.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
