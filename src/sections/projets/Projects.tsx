import styles from "./Projects.module.css";

const projects = [
  {
    title: "Portfolio Personnel",
    description:
      "Portfolio moderne développé avec Next.js et Bootstrap. Design responsive et animations fluides.",
    tags: ["Next.js", "Bootstrap", "TypeScript"],
    color: "#0dcaf0",
  },
  {
    title: "E-commerce App",
    description:
      "Application e-commerce complète avec gestion de panier, paiement et tableau de bord admin.",
    tags: ["React", "Node.js", "MongoDB"],
    color: "#6f42c1",
  },
  {
    title: "Dashboard Analytics",
    description:
      "Tableau de bord analytique avec graphiques interactifs et données en temps réel.",
    tags: ["Vue.js", "Chart.js", "REST API"],
    color: "#198754",
  },
  {
    title: "App Mobile",
    description:
      "Application mobile cross-platform pour la gestion de tâches et de projets en équipe.",
    tags: ["React Native", "Firebase"],
    color: "#fd7e14",
  },
  {
    title: "Blog Platform",
    description:
      "Plateforme de blog avec éditeur rich-text, gestion des catégories et système de commentaires.",
    tags: ["Next.js", "PostgreSQL", "Prisma"],
    color: "#d63384",
  },
  {
    title: "API REST",
    description:
      "API REST sécurisée avec authentification JWT, documentation Swagger et tests automatisés.",
    tags: ["Node.js", "Express", "JWT"],
    color: "#0d6efd",
  },
];

export default function Projects() {
  return (
    <section id="projects" className={`py-5 ${styles.section}`}>
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-white">Mes Projets</h2>
          <div className={`mx-auto mt-2 ${styles.sectionDivider}`}></div>
          <p className="text-secondary mt-3">
            Quelques projets sur lesquels j'ai travaillé
          </p>
        </div>
        <div className="row g-4">
          {projects.map((project) => (
            <div className="col-md-6 col-lg-4" key={project.title}>
              <div
                className={`card h-100 border-0 text-white ${styles.card}`}
                style={{ borderTop: `3px solid ${project.color}` }}
              >
                <div className="card-body p-4">
                  <div
                    className={`mb-3 rounded d-flex align-items-center justify-content-center fw-bold fs-4 ${styles.cardIcon}`}
                    style={{
                      background: `${project.color}22`,
                      color: project.color,
                    }}
                  >
                    &#x1F5C2;
                  </div>
                  <h5 className="card-title fw-bold mb-2">{project.title}</h5>
                  <p className="card-text text-secondary small mb-3">
                    {project.description}
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="badge rounded-pill"
                        style={{
                          background: `${project.color}22`,
                          color: project.color,
                          border: `1px solid ${project.color}44`,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
