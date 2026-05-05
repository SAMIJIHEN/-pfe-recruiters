import { SignIn, useUser } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import logo from "../../components/layout/AJ.png";
import "./Auth.css";
import PublicLayout from "../../components/layout/PublicLayout";
import PageTransition from "../../components/common/PageTransition";

export default function Login() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();

  // Redirection intelligente après connexion
  useEffect(() => {
    if (isSignedIn && user) {
      const userType = user.unsafeMetadata?.userType;
      
      if (userType === 'recruiter') {
        navigate('/recruiter-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isSignedIn, user, navigate]);

  return (
    <PublicLayout>
      <PageTransition>
        <div className="authPage">
          <div className="authCard">
            {/* PARTIE GAUCHE */}
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
                Content de <br />
                te revoir !
              </h1>
              <p>
                Connectez-vous pour accéder à votre espace personnalisé.
              </p>

              <Link className="authSideBtn" to="/register">
                Créer un compte
              </Link>
            </div>

            {/* PARTIE DROITE */}
            <div className="authRight">
              <h2 className="authTitle">Se connecter</h2>
              <p className="authSub">Entrez vos identifiants pour continuer.</p>
              
              <SignIn 
                fallbackRedirectUrl="/dashboard"
                appearance={{
                  elements: {
                    rootBox: { 
                      width: '100%',
                      maxWidth: '900px'
                    },
                    card: { 
                      boxShadow: 'none', 
                      padding: '30px',
                      width: '100%',
                      maxWidth: '800px'
                    },
                    headerTitle: { 
                      display: 'none' 
                    },
                    headerSubtitle: { 
                      display: 'none' 
                    },
                    formFieldLabel: { 
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#102A24',
                      marginBottom: '4px'
                    },
                    formFieldInput: {
                      borderRadius: '14px',
                      border: '1px solid rgba(16,42,36,.10)',
                      height: '48px',
                      fontSize: '14px',
                      padding: '0 14px',
                      marginBottom: '14px',
                      width: '100%',
                      '&:focus': {
                        boxShadow: '0 0 0 4px rgba(31,122,90,.12)',
                        borderColor: 'rgba(31,122,90,.55)'
                      }
                    },
                    formButtonPrimary: {
                      background: '#1F7A5A',
                      borderRadius: '14px',
                      height: '48px',
                      fontSize: '16px',
                      fontWeight: '900',
                      marginTop: '10px',
                      border: 'none',
                      boxShadow: '0 16px 40px rgba(31,122,90,.25)',
                      width: '100%',
                      '&:hover': { 
                        background: '#0EA371' 
                      }
                    },
                    footer: { 
                      display: 'none' 
                    },
                    identityPreview: { 
                      display: 'none' 
                    },
                    socialButtonsBlockButton: { 
                      borderRadius: '14px',
                      height: '46px',
                      border: '1px solid rgba(16,42,36,.10)',
                      background: '#fff',
                      fontWeight: '600',
                      marginBottom: '8px',
                      width: '100%',
                      '&:hover': {
                        border: '1px solid #1F7A5A',
                        background: 'rgba(31,122,90,0.05)'
                      }
                    },
                    dividerLine: { 
                      display: 'none' 
                    },
                    dividerText: { 
                      display: 'none' 
                    },
                    formField: { 
                      width: '100%' 
                    },
                    form: { 
                      width: '100%' 
                    }
                  }
                }}
              />
              
              <div className="authBottom" style={{ marginTop: '20px', textAlign: 'center' }}>
                <span>Pas encore de compte ?</span>
                <Link className="authLink" to="/register">
                  S'inscrire
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </PublicLayout>
  );
}