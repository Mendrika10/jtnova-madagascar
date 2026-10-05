import styles from "./Skills.module.css";

const skillCategories = [
  {
    title: "Front-end",
    color: "#0dcaf0",
    skills: [
      { name: "React / Next.js", level: 90 },
      { name: "TypeScript", level: 85 },
      { name: "HTML / CSS", level: 95 },
      { name: "Bootstrap", level: 88 },
    ],
  },
  {
    title: "Back-end",
    color: "#6f42c1",
    skills: [
      { name: "Node.js / Express", level: 82 },
      { name: "PostgreSQL", level: 75 },
      { name: "MongoDB", level: 78 },
      { name: "REST API", level: 88 },
    ],
  },
  {
    title: "Outils & Autres",
    color: "#198754",
    skills: [
      { name: "Git / GitHub", level: 92 },
      { name: "Docker", level: 70 },
      { name: "Vercel / Netlify", level: 85 },
      { name: "Figma", level: 72 },
    ],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="py-5 bg-dark text-white">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold">Compétences</h2>
          <div className={`mx-auto mt-2 ${styles.sectionDivider}`}></div>
          <p className="text-secondary mt-3">
            Technologies et outils que j'utilise
          </p>
        </div>
        <div className="row g-4">
          {skillCategories.map((category) => (
            <div className="col-lg-4" key={category.title}>
              <div
                className={`card border-0 h-100 text-white p-4 ${styles.card}`}
                style={{ borderTop: `3px solid ${category.color}` }}
              >
                <h4 className="fw-bold mb-4" style={{ color: category.color }}>
                  {category.title}
                </h4>
                {category.skills.map((skill) => (
                  <div className="mb-3" key={skill.name}>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small">{skill.name}</span>
                      <span className="small text-secondary">
                        {skill.level}%
                      </span>
                    </div>
                    <div className={`progress ${styles.progressBar}`}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${skill.level}%`,
                          background: category.color,
                        }}
                        aria-valuenow={skill.level}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
