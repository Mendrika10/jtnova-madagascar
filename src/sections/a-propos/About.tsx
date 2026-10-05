import styles from "./About.module.css";

export default function About() {
  return (
    <section id="about" className="py-5 bg-dark text-white">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold">À propos de moi</h2>
          <div className={`mx-auto mt-2 ${styles.sectionDivider}`}></div>
        </div>
        <div className="row align-items-center g-5">
          <div className="col-lg-4 text-center">
            <div
              className={`rounded-circle mx-auto d-flex align-items-center justify-content-center text-info fw-bold ${styles.avatar}`}
            >
              N
            </div>
          </div>
          <div className="col-lg-8">
            <h3 className="fs-2 fw-semibold mb-3">Développeur passionné</h3>
            <p className={`text-secondary mb-3 ${styles.paragraph}`}>
              Je suis un développeur web full stack avec une passion pour la
              création d'expériences numériques élégantes et performantes.
              J'aime transformer des idées complexes en interfaces simples et
              intuitives.
            </p>
            <p className={`text-secondary mb-4 ${styles.paragraph}`}>
              Toujours en veille technologique, j'aime explorer de nouveaux
              outils et frameworks pour livrer des solutions modernes et
              adaptées aux besoins des utilisateurs.
            </p>
            <div className="row g-3 mb-4">
              {[
                { label: "Nom", value: "Nante" },
                { label: "Statut", value: "Disponible" },
                { label: "Localisation", value: "Madagascar" },
                { label: "Email", value: "nante@example.com" },
              ].map((item) => (
                <div className="col-sm-6" key={item.label}>
                  <span className="text-info fw-semibold">{item.label} : </span>
                  <span className="text-secondary">{item.value}</span>
                </div>
              ))}
            </div>
            <a href="#contact" className="btn btn-info px-4">
              Me contacter
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
