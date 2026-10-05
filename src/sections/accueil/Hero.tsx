import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section
      id="hero"
      className={`d-flex align-items-center justify-content-center text-white text-center ${styles.hero}`}
    >
      <div className="container">
        <p className={`text-uppercase text-info mb-2 ${styles.subtitle}`}>
          Bonjour, je suis
        </p>
        <h1 className="display-2 fw-bold mb-3">Nante</h1>
        <h2 className="fs-3 fw-light mb-4 text-secondary">
          Développeur Web Full Stack
        </h2>
        <p className={`lead mb-5 mx-auto ${styles.description}`}>
          Je conçois et développe des applications web modernes, performantes et
          accessibles.
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <a href="#projects" className="btn btn-info btn-lg px-4">
            Voir mes projets
          </a>
          <a href="#contact" className="btn btn-outline-light btn-lg px-4">
            Me contacter
          </a>
        </div>
      </div>
    </section>
  );
}
