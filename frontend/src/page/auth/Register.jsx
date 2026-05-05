import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "../../components/layout/AJ.png";
import "./Auth.css";
import PublicLayout from "../../components/layout/PublicLayout";
import PageTransition from "../../components/common/PageTransition";

import CandidateSignUp from "./register/CandidateSignUp";
import RecruiterSignUpWizard from "./register/RecruiterSignUpWizard";

export default function Register() {
  const [userType, setUserType] = useState("candidate");

  return (
    <PublicLayout>
      <PageTransition>
        <div className="authPage">
          <div className="authCard">
            {/* PARTIE GAUCHE - Branding */}
            <div className="authLeft">
              <div className="authBrand">
                <div className="authLogo">
                  <img src={logo} alt="AJ Recruiters" className="authLogoImg" />
                </div>
                <div>
                  <div style={{ fontWeight: 1000 }}>AJ Recruiters</div>
                  <div style={{ opacity: 0.9, fontSize: 12 }}>
                    Recrutement Assisté
                  </div>
                </div>
              </div>

              <h1>
                {userType === "candidate"
                  ? "Bonjour, Bienvenue !"
                  : "Espace Recruteur Professionnel"}
              </h1>
              <p>
                {userType === "candidate"
                  ? "Rejoignez la plateforme de recrutement nouvelle génération. Trouvez le job de vos rêves."
                  : "Créez votre compte entreprise et commencez à recruter les meilleurs talents."}
              </p>

              <Link className="authSideBtn" to="/login">
                Déjà un compte ? Se connecter
              </Link>
            </div>

            {/* PARTIE DROITE */}
            <div className="authRight">
              <h2 className="authTitle">Créer un compte</h2>
              <p className="authSub">
                {userType === "candidate"
                  ? "Choisissez votre profil pour commencer"
                  : "Configurez votre espace recruteur"}
              </p>

              {/* Onglets de sélection */}
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${userType === "candidate" ? "active" : ""}`}
                  onClick={() => setUserType("candidate")}
                >
                  👤 Candidat
                </button>
                <button
                  className={`auth-tab ${userType === "recruiter" ? "active" : ""}`}
                  onClick={() => setUserType("recruiter")}
                >
                  🏢 Recruteur (RH)
                </button>
              </div>

              {/* Body */}
              {userType === "candidate" ? (
                <CandidateSignUp />
              ) : (
                <RecruiterSignUpWizard userType={userType} />
              )}

              {/* Lien vers login pour les deux profils */}
              <div className="authBottom" style={{ marginTop: "20px", textAlign: "center" }}>
                <span>Déjà un compte ?</span>
                <Link className="authLink" to="/login">
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </PublicLayout>
  );
}