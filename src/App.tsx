import profilePhoto from "../assets/profile-photo.jpg";
import { projects } from "./projects";

export default function App() {
  return (
    <main className="page">
      <aside className="intro">
        <img className="photo" src={profilePhoto} alt="George Pearse" width={180} height={180} />
        <h1 className="name">George Pearse</h1>
        <p className="role">
          Head of Platform Engineering at <a href="https://visia.ai">Visia</a>
        </p>
        <a className="github" href="https://github.com/GeorgePearse">
          github.com/GeorgePearse
        </a>
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
