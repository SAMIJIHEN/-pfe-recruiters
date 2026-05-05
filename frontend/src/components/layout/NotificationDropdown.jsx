// frontend/src/components/layout/NotificationDropdown.jsx
import { motion, AnimatePresence } from "framer-motion";
import { BellIcon } from "@heroicons/react/24/outline";

export function NotificationDropdown({ 
  showNotifications, 
  setShowNotifications, 
  notifications, 
  unreadCount, 
  markAsReadAndDelete, 
  deleteNotification, 
  markAllAsReadAndDelete, 
  userType, 
  formatDate 
}) {
  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowNotifications(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
            >
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                {unreadCount > 0 && userType !== "recruiter" && (
                  <button
                    onClick={markAllAsReadAndDelete}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Tout lire
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    <BellIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune notification</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${
                        !notif.read ? "bg-emerald-50/30" : ""
                      }`}
                      onClick={() => {
                        if (userType !== "recruiter") {
                          markAsReadAndDelete(notif.id);
                        } else {
                          deleteNotification(notif.id);
                        }
                        setShowNotifications(false);
                      }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{notif.icon}</span>
                            <p className={`text-sm ${!notif.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                              {notif.text}
                            </p>
                          </div>
                          {notif.message && (
                            <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              notif.type === "success" ? "bg-green-100 text-green-700" :
                              notif.type === "warning" ? "bg-amber-100 text-amber-700" :
                              "bg-blue-100 text-blue-700"
                            }`}>
                              {notif.label}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(notif.createdAt)}
                            </span>
                          </div>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}