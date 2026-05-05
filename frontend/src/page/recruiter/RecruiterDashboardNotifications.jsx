// frontend/src/page/recruiter/RecruiterDashboardNotifications.jsx
import { motion, AnimatePresence } from "framer-motion";
import {
  BellAlertIcon,
  XCircleIcon,
  CheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  getNotificationTypeStyle,
  groupNotificationsByDate,
  getRelativeNotificationTime,
} from "./RecruiterDashboardUtils";

// ==================== NOTIFICATION DRAWER ====================
export function NotificationDrawer({
  isOpen,
  notifications,
  unreadCount,
  onClose,
  onMarkAllAsRead,
  onMarkAsRead,
  onDelete,
}) {
  const grouped = groupNotificationsByDate(notifications);
  const orderedLabels = ["Aujourd'hui", "Hier", "Cette semaine", "Plus ancien"].filter((label) => grouped[label]?.length);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[120] bg-slate-950/45 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 z-[130] flex h-screen w-full max-w-[460px] flex-col overflow-hidden border-l border-emerald-100 bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.18)]"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 px-6 pb-6 pt-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%)]" />
              <div className="absolute -bottom-16 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur">
                      <BellAlertIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold leading-none tracking-tight text-white">Notifications</h3>
                      <p className="mt-2 text-sm font-medium text-white/85">
                        {notifications.length} élément{notifications.length > 1 ? "s" : ""} • {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white transition hover:bg-white/25"
                  title="Fermer"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="relative mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  disabled={unreadCount === 0}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4" />
                  Tout marquer comme lu
                </button>

                {unreadCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/95 border border-white/20">
                    {unreadCount} à traiter
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/90 px-5 py-5">
              {notifications.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                    <BellAlertIcon className="h-8 w-8" />
                  </div>
                  <p className="text-lg font-semibold text-slate-800">Aucune notification</p>
                  <p className="mt-1 text-sm text-slate-500">Tout est déjà à jour pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orderedLabels.map((label) => (
                    <section key={label}>
                      <div className="mb-3 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 border border-slate-200 shadow-sm">
                          {label}
                        </span>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>

                      <div className="space-y-3">
                        <AnimatePresence initial={false}>
                          {grouped[label].map((notif) => {
                            const style = getNotificationTypeStyle(notif.type);
                            return (
                              <motion.div
                                key={notif.id}
                                layout
                                initial={{ opacity: 0, x: 18 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 22 }}
                                transition={{ duration: 0.18 }}
                                className={`group rounded-[24px] border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                                  notif.read ? "border-slate-200" : "border-emerald-200 ring-1 ring-emerald-100"
                                }`}
                              >
                                <div className="flex items-start gap-3.5">
                                  <div className={`mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.iconWrap.replace("/15","/12")}`}>
                                    <span className="text-2xl">{notif.icon}</span>
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          {!notif.read && <span className={`h-2.5 w-2.5 rounded-full ${style.dot} animate-pulse`} />}
                                          <p className={`text-[15px] leading-7 ${notif.read ? "font-medium text-slate-700" : "font-semibold text-slate-900"}`}>
                                            {notif.text}
                                          </p>
                                        </div>

                                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${style.badge}`}>
                                            {notif.label || "Notification"}
                                          </span>
                                          <span className="text-xs font-medium text-slate-400">
                                            {getRelativeNotificationTime(notif.createdAt || notif.date)}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex shrink-0 items-center gap-1.5 opacity-100 md:opacity-0 md:translate-x-1 md:group-hover:translate-x-0 md:group-hover:opacity-100 transition">
                                        {!notif.read && (
                                          <button
                                            type="button"
                                            onClick={() => onMarkAsRead(notif.id)}
                                            className="rounded-xl bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-100"
                                            title="Marquer comme lu"
                                          >
                                            <CheckIcon className="h-4 w-4" />
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => onDelete(notif.id)}
                                          className="rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-500"
                                          title="Supprimer"
                                        >
                                          <TrashIcon className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>

                                    {!notif.read && (
                                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-emerald-100">
                                        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}