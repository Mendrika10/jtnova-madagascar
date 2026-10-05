import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={`bg-dark text-white py-4 ${styles.footer}`}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <span className="fw-bold text-info">&lt;Nante /&gt;</span>
            <span className="text-secondary ms-2">
              — Développeur Web Full Stack
            </span>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <span className="text-secondary small">
              © {year} Nante. Tous droits réservés.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
