import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMyLeaves, getLeaveStatistics } from "../api/leaveApi";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }
    
    // Check if token exists in localStorage (more reliable than isAuthenticated state)
    const token = localStorage.getItem("token");
    
    if (!token) {
      // No token, redirect to login
      window.location.href = "/login";
      return;
    }
    
    // Token exists, fetch data
    fetchData();
  }, [authLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No token found");
        window.location.href = "/login";
        return;
      }

      const [leavesRes, statsRes] = await Promise.all([
        getMyLeaves(),
        getLeaveStatistics()
      ]);
      setLeaves(leavesRes.data);
      setStatistics(statsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      // If it's a 401 error, the axios interceptor will handle it
      if (err.response?.status === 401) {
        // Token is invalid, redirect will happen via interceptor
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const getSummaryStats = () => {
    if (!statistics || !leaves) return null;

    const pendingLeaves = leaves.filter(
      (leave) =>
        leave.status === "PENDING_HOD" ||
        leave.status === "PENDING_DEAN" ||
        leave.status === "PENDING_PRINCIPAL"
    );

    const approvedLeaves = leaves.filter((leave) => leave.status === "APPROVED");
    const rejectedLeaves = leaves.filter((leave) => leave.status === "REJECTED");

    return {
      totalLeavesTaken: statistics.summary.totalLeavesTaken,
      totalDaysTaken: statistics.summary.totalLeavesDays,
      leavesRemaining: statistics.summary.totalLeavesRemaining,
      pendingRequests: pendingLeaves.length,
      approved: approvedLeaves.length,
      pending: pendingLeaves.length,
      rejected: rejectedLeaves.length
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING_HOD":
        return "bg-yellow-100 text-yellow-800";
      case "PENDING_DEAN":
        return "bg-blue-100 text-blue-800";
      case "PENDING_PRINCIPAL":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Show loading while auth is loading or data is fetching
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }
  
  // Check token one more time before rendering
  const token = localStorage.getItem("token");
  if (!token) {
    return null; // Will redirect via useEffect
  }

  const summaryStats = getSummaryStats();
  const currentYear = statistics?.currentYear || new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Apply Leave Button */}
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Teacher Dashboard
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              to="/apply-leave"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Apply Leave
            </Link>
          </motion.div>
        </div>

        {/* Leave Balance Section - Show First */}
        {statistics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Leave Balance ({currentYear})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(statistics.byType).map(([type, data], i) => {
                const hasLimit = data.hasLimit !== false;
                const percentage = hasLimit && data.limit > 0 ? (data.taken / data.limit) * 100 : 0;

                return (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white rounded-xl shadow-lg p-5 border border-gray-100"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-600">{type}</span>
                      {!hasLimit && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                          No Limit
                        </span>
                      )}
                    </div>
                    {hasLimit ? (
                      <>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Taken: {data.taken} days</span>
                            <span>Limit: {data.limit} days</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(percentage, 100)}%` }}
                              transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                              className="h-2 rounded-full bg-blue-500"
                            />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {data.remaining} <span className="text-sm font-normal text-gray-500">days left</span>
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Taken: {data.taken} days</span>
                            <span className="text-blue-600 font-semibold">Unlimited</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full bg-blue-400" style={{ width: "100%" }} />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          <span className="text-sm font-normal text-gray-500">Unlimited</span>
                        </p>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Summary Statistics Cards - Show After Leave Balance */}
        {summaryStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Total Leaves Taken */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Total Leaves Taken</p>
                    <p className="text-4xl font-bold">{summaryStats.totalLeavesTaken}</p>
                    <p className="text-blue-100 text-sm mt-1">{summaryStats.totalDaysTaken} days</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Total Days Taken */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-1">Total Days Taken</p>
                    <p className="text-4xl font-bold">{summaryStats.totalDaysTaken}</p>
                    <p className="text-purple-100 text-sm mt-1">out of {statistics.summary.totalLeavesLimit} days</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Leaves Remaining */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-1">Leaves Remaining</p>
                    <p className="text-4xl font-bold">{summaryStats.leavesRemaining}</p>
                    <p className="text-green-100 text-sm mt-1">days available</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Pending Requests */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-amber-100 text-sm font-medium mb-1">Pending Requests</p>
                    <p className="text-4xl font-bold">{summaryStats.pendingRequests}</p>
                    <p className="text-amber-100 text-sm mt-1">awaiting approval</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Approved */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium mb-1">Approved</p>
                    <p className="text-4xl font-bold">{summaryStats.approved}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Pending */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium mb-1">Pending</p>
                    <p className="text-4xl font-bold">{summaryStats.pending}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Rejected */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-red-100 text-sm font-medium mb-1">Rejected</p>
                    <p className="text-4xl font-bold">{summaryStats.rejected}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}