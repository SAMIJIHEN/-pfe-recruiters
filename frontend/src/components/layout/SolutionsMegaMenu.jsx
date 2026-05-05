// frontend/src/components/layout/SolutionsMegaMenu.jsx
// ═══════════════════════════════════════════════════════════════
// ✅ MODIFICATION: Liens redirigés vers /solution-recruteurs et /solution-candidats
// ═══════════════════════════════════════════════════════════════

import { Link } from "react-router-dom";

function MegaLink({ title, description, to = "#", onClick }) {
  return (
    <Link
      to={to}
      className="srh-link"
      style={{ padding: "8px 12px" }}
      onClick={onClick}
    >
      <div style={{ fontWeight: 700 }}>{title}</div>
      {description && (
        <div style={{ fontSize: "12px", opacity: 0.7, marginTop: "2px" }}>
          {description}
        </div>
      )}
    </Link>
  );
}

export function SolutionsMegaMenu({ close }) {
  return (
    <div className="srh-grid" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
      <div>
        <p className="srh-title">SOLUTIONS</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <MegaLink
            title="Pour recruteurs"
            description="Publier, trier et suivre les candidatures."
            to="/solution-recruteurs"
            onClick={close}
          />
          <MegaLink
            title="Pour candidats"
            description="Postuler et suivre vos étapes en temps réel."
            to="/solution-candidats"
            onClick={close}
          />
        </div>
      </div>

      <div>
        <div className="srh-preview-card">
          <div className="srh-preview-head">🎯 Tout-en-un</div>
          <p className="srh-preview-text">
            Une solution complète pour recruter plus vite, avec une expérience
            professionnelle.
          </p>
          <div className="srh-preview-box">
            <span>🚀 Commencer </span>
            <Link className="srh-preview-link" to="/register" onClick={close}>
              Commencer →
            </Link>
          </div>
          <div className="srh-preview-box" style={{ marginTop: 10 }}>
            <span>📊 Démo</span>
            <Link className="srh-preview-link" to="/demo" onClick={close}>
              Voir une démo →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}