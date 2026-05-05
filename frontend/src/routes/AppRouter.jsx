// frontend/src/routes/AppRouter.jsx
// ═══════════════════════════════════════════════════════════════
// ✅ MODIFICATION: Redirection des anciennes pages vers /solution-recruteurs
// ✅ Les pages supprimées sont redirigées vers la page solution recruteurs
// ═══════════════════════════════════════════════════════════════

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

// Public pages
import Home from "../page/public/Home";
import SolutionCandidats from "../page/public/SolutionCandidats";
import SolutionRecruteurs from "../page/public/SolutionRecruteurs";

// Auth pages
import Login from "../page/auth/Login";
import Register from "../page/auth/Register";
import CompleteProfile from "../page/dashboard/CompleteProfile";
import Dashboard from "../page/dashboard/Dashboard";

// Pages Recruteur
import RecruiterPending from "../page/auth/RecruiterPending";
import RecruiterDashboard from "../page/recruiter/RecruiterDashboard";
import CompanyProfile from "../page/recruiter/CompanyProfile";
import JobOfferList from "../page/recruiter/JobOfferList";
import JobOfferForm from "../page/recruiter/JobOfferForm";
import JobOfferDetail from "../page/recruiter/JobOfferDetail";
import TalentPoolList from "../page/recruiter/TalentPoolList";

// Pages publiques supplémentaires
import About from "../page/public/About";
import Contact from "../page/public/Contact";
import Support from "../page/public/Support";
import FAQ from "../page/public/FAQ";

// Page de détail d'offre pour les candidats
import JobDetail from "../page/public/JobDetail";

// Routes ADMIN
import AdminLogin from "../page/admin/AdminLogin";
import AdminDashboard from "../page/admin/AdminDashboard";

// Composant de route protégée
function ProtectedRoute({ children, allowedUserType }) {
  const { user, isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  const userType = user?.unsafeMetadata?.userType;
  
  if (allowedUserType && userType !== allowedUserType) {
    if (userType === 'recruiter') {
      return <Navigate to="/recruiter-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

// Composant pour les pages publiques (déjà connecté)
function PublicOnlyRoute({ children }) {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== ROUTES PUBLIQUES PRINCIPALES ===== */}
        <Route path="/" element={<Home />} />
        <Route path="/solution-candidats" element={<SolutionCandidats />} />
        <Route path="/solution-recruteurs" element={<SolutionRecruteurs />} />
        
        {/* ===== REDIRECTIONS DES ANCIENNES PAGES VERS SOLUTION RECRUTEURS ===== */}
        <Route path="/organisation-intelligente" element={<Navigate to="/solution-recruteurs" replace />} />
        <Route path="/decisions-eclairees" element={<Navigate to="/solution-recruteurs" replace />} />
        <Route path="/workflow-personnalise" element={<Navigate to="/solution-recruteurs" replace />} />
        <Route path="/collaboration-equipe" element={<Navigate to="/solution-recruteurs" replace />} />
        <Route path="/securite-maximale" element={<Navigate to="/solution-recruteurs" replace />} />
        <Route path="/interface-premium" element={<Navigate to="/solution-recruteurs" replace />} />

        {/* ===== AUTRES ROUTES PUBLIQUES ===== */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/support" element={<Support />} />
        <Route path="/faq" element={<FAQ />} />

        {/* ===== ROUTES D'AUTHENTIFICATION ===== */}
        <Route path="/login" element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        } />
        <Route path="/register" element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        } />

        {/* ===== ROUTES CANDIDAT ===== */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedUserType="candidate">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/complete-profile" element={
          <ProtectedRoute allowedUserType="candidate">
            <CompleteProfile />
          </ProtectedRoute>
        } />

        {/* ===== ROUTES PUBLIQUES OFFRES ===== */}
        <Route path="/jobs/:id" element={<JobDetail />} />

        {/* ===== ROUTES RECRUTEUR ===== */}
        <Route path="/recruiter-dashboard" element={
          <ProtectedRoute allowedUserType="recruiter">
            <RecruiterDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/recruiter/company-profile" element={
          <ProtectedRoute allowedUserType="recruiter">
            <CompanyProfile />
          </ProtectedRoute>
        } />
        
        <Route path="/recruiter/job-offers" element={
          <ProtectedRoute allowedUserType="recruiter">
            <JobOfferList />
          </ProtectedRoute>
        } />
        
        <Route path="/recruiter/job-offers/new" element={
          <ProtectedRoute allowedUserType="recruiter">
            <JobOfferForm />
          </ProtectedRoute>
        } />
        
        <Route path="/recruiter/job-offers/:id" element={
          <ProtectedRoute allowedUserType="recruiter">
            <JobOfferDetail />
          </ProtectedRoute>
        } />
        
        <Route path="/recruiter/job-offers/:id/edit" element={
          <ProtectedRoute allowedUserType="recruiter">
            <JobOfferForm />
          </ProtectedRoute>
        } />
        
        <Route path="/recruiter-pending" element={<RecruiterPending />} />

        <Route path="/recruiter/talent-pool" element={
          <ProtectedRoute allowedUserType="recruiter">
            <TalentPoolList />
          </ProtectedRoute>
        } />

        {/* ===== ROUTES ADMINISTRATEUR ===== */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* ===== FALLBACK ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}