import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { logoutUser, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logoutUser();
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/90 backdrop-blur-lg shadow-md sticky top-0 z-50 border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link
            to="/dashboard"
            onClick={closeMenu}
            className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate max-w-[180px] sm:max-w-none"
          >
            Leave Management
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/apply-leave"
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
            >
              Apply Leave
            </Link>
            {user?.name && (
              <span className="text-gray-600 text-sm lg:text-base font-medium truncate max-w-[120px] lg:max-w-[180px]" title={user.name}>
                Welcome, {user.name}
              </span>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm whitespace-nowrap"
            >
              Logout
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-gray-100 bg-white"
          >
            <div className="px-4 py-3 space-y-1">
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className="block py-3 px-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/apply-leave"
                onClick={closeMenu}
                className="block py-3 px-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium"
              >
                Apply Leave
              </Link>
              {user?.name && (
                <div className="py-3 px-3 text-gray-600 font-medium border-b border-gray-100">
                  Welcome, {user.name}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left py-3 px-3 rounded-lg text-red-600 hover:bg-red-50 font-medium"
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
