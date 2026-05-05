// frontend/src/components/layout/NavbarPro.jsx
import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import logo from "./AJ.png";
import "./NavbarPro.css";
import { useNavbarNotifications } from "./useNavbarNotifications";
import { NotificationDropdown } from "./NotificationDropdown";
import { SolutionsMegaMenu } from "./SolutionsMegaMenu";
import { LogoutModal } from "./LogoutModal";

function MenuItem({ label, isOpen, onOpen, onClose }) {
  return (
    <div className="srh-item" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        className={`srh-menubtn ${isOpen ? "is-open" : ""}`}
        type="button"
        onFocus={onOpen}
      >
        {label} <span className="srh-caret">▾</span>
      </button>
    </div>
  );
}

export default function NavbarPro() {
  const { user, isSignedIn } = useUser();
  const location = useLocation();
  const [open, setOpen] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const wrapRef = useRef(null);
  const closeTimer = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const {
    notifications,
    unreadCount,
    markAsReadAndDelete,
    deleteNotification,
    markAllAsReadAndDelete,
  } = useNavbarNotifications();

  const isDashboardPage = location.pathname === "/dashboard" || 
                          location.pathname === "/recruiter-dashboard" ||
                          location.pathname.startsWith("/recruiter/") ||
                          location.pathname === "/complete-profile";

  const getDashboardLink = () => {
    if (!isSignedIn || !user) return "/login";
    const userType = user.unsafeMetadata?.userType;
    return userType === "recruiter" ? "/recruiter-dashboard" : "/dashboard";
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openMenu = (key) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(key);
  };

  const closeMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 120);
  };

  useEffect(() => {
    const onDown = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <>
      <header
        className={`srh-header ${isScrolled ? "srh-header-scrolled" : ""}`}
        ref={wrapRef}
      >
        <div className="srh-nav">
          <div className="srh-container srh-nav-inner">
            <Link
              to="/"
              className="srh-logo"
              aria-label="AJ Recruitment"
              onClick={() => setOpen(null)}
            >
              <div className="srh-logo-badge">
                <img src={logo} alt="AJ Recruitment" className="srh-logo-img" />
              </div>
              <div className="srh-logo-text-container">
                <span className="srh-logo-text">Recruiters</span>
              </div>
            </Link>

            {!isDashboardPage && (
              <nav className="srh-menu" aria-label="Top navigation">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `srh-menubtn ${isActive ? "is-active" : ""}`
                  }
                  onClick={() => setOpen(null)}
                >
                  Accueil
                </NavLink>

                <MenuItem
                  label="Solutions"
                  isOpen={open === "solutions"}
                  onOpen={() => openMenu("solutions")}
                  onClose={closeMenu}
                />
              </nav>
            )}

            <div className="srh-actions">
              {isSignedIn ? (
                <>
                  <NavLink
                    to={getDashboardLink()}
                    className={({ isActive }) =>
                      `srh-login ${isActive ? "is-active" : ""}`
                    }
                    onClick={() => setOpen(null)}
                  >
                    Dashboard
                  </NavLink>

                  {/* BOUTON DE DÉCONNEXION */}
                  <motion.button
                    whileHover={{ y: -1, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLogoutModal(true)}
                    className="srh-logout-glass"
                  >
                    <span className="srh-logout-glass-icon">
                      <ArrowPathIcon className="srh-logout-glass-icon-svg" />
                    </span>
                    <span className="srh-logout-glass-text">
                      <span className="srh-logout-glass-label">Compte</span>
                      <span className="srh-logout-glass-action">Déconnexion</span>
                    </span>
                  </motion.button>

                  {/* NOTIFICATION BELL */}
                  <NotificationDropdown
                    showNotifications={showNotifications}
                    setShowNotifications={setShowNotifications}
                    notifications={notifications}
                    unreadCount={unreadCount}
                    markAsReadAndDelete={markAsReadAndDelete}
                    deleteNotification={deleteNotification}
                    markAllAsReadAndDelete={markAllAsReadAndDelete}
                    userType={user?.unsafeMetadata?.userType}
                    formatDate={formatDate}
                  />
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `srh-login ${isActive ? "is-active" : ""}`
                    }
                    onClick={() => setOpen(null)}
                  >
                    Se connecter
                  </NavLink>

                  <NavLink
                    to="/register"
                    className="srh-cta"
                    onClick={() => setOpen(null)}
                  >
                    Commencer
                  </NavLink>
                </>
              )}
            </div>
          </div>

          {open && (
            <div
              className="srh-mega"
              onMouseEnter={() => openMenu(open)}
              onMouseLeave={closeMenu}
            >
              <div className="srh-container srh-mega-inner">
                {open === "solutions" && (
                  <SolutionsMegaMenu close={() => setOpen(null)} />
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <LogoutModal show={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </>
  );
}