import { Link } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";
import PageTransition from "../../components/common/PageTransition";
import logo from "../../components/layout/AJ.png";

export default function RecruiterPending() {
  return (
    <PublicLayout>
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-lg mb-8 p-3 border border-emerald-100">
              <img src={logo} alt="AJ Recruiters" className="w-full h-full object-contain" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Compte en attente de validation
            </h1>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="text-6xl mb-6">⏳</div>
              
              <p className="text-lg text-gray-700 mb-4">
                Merci pour votre inscription ! Votre demande de compte recruteur est en cours de vérification par notre équipe.
              </p>
              
              <div className="bg-emerald-50 rounded-xl p-6 text-left mb-6">
                <h3 className="font-semibold text-emerald-800 mb-3">
                  📋 Prochaines étapes :
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">1.</span>
                    Notre équipe examine votre demande (24-48h ouvrées)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">2.</span>
                    Vous recevrez un email de confirmation
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">3.</span>
                    Une fois validé, vous pourrez accéder à votre espace recruteur
                  </li>
                </ul>
              </div>
              
              <p className="text-gray-600 mb-6">
                En attendant, vous pouvez déjà préparer vos offres d'emploi !
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/"
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
                >
                  Retour à l'accueil
                </Link>
                <a
                  href="mailto:support@ajrecruiters.com"
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium"
                >
                  Contacter le support
                </a>
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              Vous recevrez un email dès que votre compte sera validé.
            </p>
          </div>
        </div>
      </PageTransition>
    </PublicLayout>
  );
}