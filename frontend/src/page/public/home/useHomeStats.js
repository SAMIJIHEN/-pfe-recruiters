// frontend/src/page/public/home/useHomeStats.js
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export function useHomeStats() {
  const { user } = useUser();
  const userId = user?.id;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/applications/for-recruiter/`, {
          headers: {
            "X-Clerk-User-Id": userId,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

        const data = await res.json();
        const applications = data.results || [];
        const total = data.count || 0;

        // Offres distinctes actives
        const uniqueJobs = new Set(applications.map((a) => a.job_details?.id || a.job)).size;

        // Entretiens en cours (status = "interview")
        const interviews = applications.filter(
          (a) => a.status === "interview"
        ).length;

        // Candidatures acceptées
        const accepted = applications.filter(
          (a) => a.status === "accepted"
        ).length;

        // Taux de conversion : acceptés / total
        const conversionRate =
          total > 0 ? Math.round((accepted / total) * 100) : 0;

        setStats({
          activeJobs: uniqueJobs,
          totalCandidates: total,
          interviews,
          conversionRate,
        });
      } catch (err) {
        console.error("Erreur chargement stats:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return { stats, loading, error };
}