// frontend/src/components/layout/useNavbarNotifications.js
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import api from "../../services/api";

export function useNavbarNotifications() {
  const { user, isSignedIn } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]); // ✅ Déjà correct

  const buildRecruiterNotifications = async () => {
    if (!isSignedIn) return [];
    try {
      const userType = user?.unsafeMetadata?.userType;
      if (userType === "recruiter") {
        const appsRes = await api.get("/applications/for-recruiter/");
        const applications = appsRes.data.results || appsRes.data || [];
        const offersRes = await api.get("/job-offers/my_offers/");
        const offers = offersRes.data.results || offersRes.data || [];

        const notifs = [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const newAppsToday = applications.filter(app => new Date(app.applied_at) >= today);
        if (newAppsToday.length > 0) {
          notifs.push({
            id: `new-apps-${Date.now()}`,
            icon: "🆕",
            text: `${newAppsToday.length} nouvelle${newAppsToday.length > 1 ? "s" : ""} candidature${newAppsToday.length > 1 ? "s" : ""} reçue${newAppsToday.length > 1 ? "s" : ""} aujourd'hui`,
            read: false,
            type: "info",
            label: "Nouvelles candidatures",
            createdAt: now.toISOString(),
          });
        }

        const stalePending = applications.filter(app => app.status === "pending" && new Date(app.applied_at) < threeDaysAgo);
        if (stalePending.length > 0) {
          notifs.push({
            id: `stale-pending-${Date.now()}`,
            icon: "⏳",
            text: `${stalePending.length} candidature${stalePending.length > 1 ? "s" : ""} en attente depuis plus de 3 jours`,
            read: false,
            type: "warning",
            label: "Action requise",
            createdAt: threeDaysAgo.toISOString(),
          });
        }

        const completedTests = applications.filter(app => app.test_result && Object.keys(app.test_result).length > 0 && app.status !== "reviewed");
        if (completedTests.length > 0) {
          notifs.push({
            id: `completed-tests-${Date.now()}`,
            icon: "📝",
            text: `${completedTests.length} candidat${completedTests.length > 1 ? "s" : ""} ont complété leur test, à analyser`,
            read: false,
            type: "success",
            label: "Tests à analyser",
            createdAt: now.toISOString(),
          });
        }

        const emptyOffers = offers.filter(offer => {
          if (offer.status !== "active") return false;
          const hasApps = applications.some(app => String(app.job) === String(offer.id));
          const offerDate = new Date(offer.published_at || offer.created_at);
          return !hasApps && offerDate < sevenDaysAgo;
        });
        if (emptyOffers.length > 0) {
          notifs.push({
            id: `empty-offers-${Date.now()}`,
            icon: "📢",
            text: `${emptyOffers.length} offre${emptyOffers.length > 1 ? "s" : ""} active${emptyOffers.length > 1 ? "s" : ""} sans candidature depuis 7 jours`,
            read: true,
            type: "warning",
            label: "À promouvoir",
            createdAt: sevenDaysAgo.toISOString(),
          });
        }

        const recentAccepted = applications.filter(app => app.status === "accepted" && new Date(app.updated_at || app.applied_at) >= sevenDaysAgo);
        if (recentAccepted.length > 0) {
          notifs.push({
            id: `recent-accepted-${Date.now()}`,
            icon: "✅",
            text: `${recentAccepted.length} candidature${recentAccepted.length > 1 ? "s" : ""} acceptée${recentAccepted.length > 1 ? "s" : ""} récemment`,
            read: true,
            type: "success",
            label: "Recrutements réussis",
            createdAt: now.toISOString(),
          });
        }

        const testsSentToday = applications.filter(app => app.test_sent_at && new Date(app.test_sent_at) >= today);
        if (testsSentToday.length > 0) {
          notifs.push({
            id: `tests-sent-${Date.now()}`,
            icon: "✉️",
            text: `${testsSentToday.length} test${testsSentToday.length > 1 ? "s" : ""} envoyé${testsSentToday.length > 1 ? "s" : ""} aujourd'hui`,
            read: true,
            type: "info",
            label: "Tests envoyés",
            createdAt: now.toISOString(),
          });
        }

        if (notifs.length === 0) {
          notifs.push({
            id: "all-good",
            icon: "✅",
            text: "Tout est à jour, aucune action requise",
            read: true,
            type: "success",
            label: "Système",
            createdAt: now.toISOString(),
          });
        }

        notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return notifs;
      } else {
        const response = await api.get("/notifications/");
        let data = response.data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          data = data.results || [];
        }
        // ✅ S'assurer que data est toujours un tableau
        if (!Array.isArray(data)) {
          data = [];
        }
        return data.map(n => ({
          id: n.id,
          icon: "📢",
          text: n.title,
          message: n.message,
          read: n.is_read,
          type: "info",
          label: "Notification",
          createdAt: n.created_at,
        }));
      }
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
      return [];
    }
  };

  const fetchNotifications = async () => {
    if (!isSignedIn) return;
    const notifs = await buildRecruiterNotifications();
    // ✅ S'assurer que notifs est un tableau
    setNotifications(Array.isArray(notifs) ? notifs : []);
    setUnreadCount(Array.isArray(notifs) ? notifs.filter(n => !n.read).length : 0);
  };

  const markAsReadAndDelete = async (id) => {
    try {
      await api.patch(`/notifications/${id}/`, { is_read: true });
      // ✅ Utiliser la fonction callback avec le state actuel
      setNotifications(prev => {
        if (!Array.isArray(prev)) return [];
        return prev.filter(n => n.id !== id);
      });
      setUnreadCount(prev => {
        const currentPrev = typeof prev === 'number' ? prev : 0;
        return Math.max(0, currentPrev - 1);
      });
    } catch (error) {
      console.error("Erreur marquage notification:", error);
    }
  };

  const deleteNotification = (id) => {
    // ✅ Utiliser la fonction callback avec le state actuel
    setNotifications(prev => {
      if (!Array.isArray(prev)) return [];
      return prev.filter(n => n.id !== id);
    });
    setUnreadCount(prev => {
      const currentPrev = typeof prev === 'number' ? prev : 0;
      const currentNotifications = notifications;
      if (!Array.isArray(currentNotifications)) return currentPrev;
      const wasUnread = currentNotifications.find(n => n.id === id && !n.read);
      return wasUnread ? Math.max(0, currentPrev - 1) : currentPrev;
    });
  };

  const markAllAsReadAndDelete = async () => {
    // ✅ S'assurer que notifications est un tableau
    const currentNotifications = Array.isArray(notifications) ? notifications : [];
    const unreadIds = currentNotifications.filter(n => !n.read).map(n => n.id);
    for (const id of unreadIds) {
      await api.patch(`/notifications/${id}/`, { is_read: true });
    }
    setNotifications([]);
    setUnreadCount(0);
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
      setNotifications([]);
    }
  }, [isSignedIn]);

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsReadAndDelete,
    deleteNotification,
    markAllAsReadAndDelete,
  };
}