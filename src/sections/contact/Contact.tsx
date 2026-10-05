"use client";

import { useState } from "react";
import styles from "./Contact.module.css";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", message: "" });
  };

  const contactInfos = [
    { icon: "\u{1F4CD}", label: "Localisation", value: "Madagascar" },
    { icon: "\u{1F4E7}", label: "Email", value: "nante@example.com" },
    {
      icon: "\u{1F4BC}",
      label: "Disponibilite",
      value: "Ouvert aux opportunites",
    },
  ];

  return (
    <section id="contact" className={`py-5 ${styles.section}`}>
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-white">Contact</h2>
          <div className={`mx-auto mt-2 ${styles.sectionDivider}`}></div>
          <p className="text-secondary mt-3">
            {`N'hesitez pas a me contacter pour tout projet ou collaboration`}
          </p>
        </div>
        <div className="row g-5 justify-content-center">
          <div className="col-lg-5">
            <div className="d-flex flex-column gap-4">
              {contactInfos.map((item) => (
                <div
                  className="d-flex align-items-center gap-3"
                  key={item.label}
                >
                  <div
                    className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${styles.contactIcon}`}
                  >
                    <span>{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-info small mb-0 fw-semibold">
                      {item.label}
                    </p>
                    <p className="text-white mb-0">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-6">
            {sent ? (
              <div className="alert alert-info text-center py-4">
                <strong>Message envoye !</strong> Je vous repondrai dans les
                plus brefs delais.
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="d-flex flex-column gap-3"
              >
                <div>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    required
                    className={`form-control form-control-lg ${styles.formInput}`}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Votre email"
                    required
                    className={`form-control form-control-lg ${styles.formInput}`}
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Votre message"
                    required
                    rows={5}
                    className={`form-control form-control-lg ${styles.formInput}`}
                    style={{ resize: "none" }}
                  />
                </div>
                <button type="submit" className="btn btn-info btn-lg w-100">
                  Envoyer le message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
