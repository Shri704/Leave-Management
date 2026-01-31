import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { applyLeave } from "../api/leaveApi";
import Navbar from "../components/Navbar";

export default function ApplyLeave() {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.leaveType || !form.fromDate || !form.toDate || !form.reason) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await applyLeave(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply leave");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Apply for Leave</h1>
          <p className="text-gray-600">Fill in the details below to submit your leave request</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={submit}
          className="bg-white p-8 rounded-2xl shadow-xl"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={form.leaveType || ""}
                onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                required
              >
                <option value="">Select Leave Type</option>
                <option value="CL">CL - Casual Leave</option>
                <option value="SL">SL - Sick Leave</option>
                <option value="EL">EL - Earned Leave</option>
                <option value="OD">OD - On Duty</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={form.fromDate || ""}
                  onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={form.toDate || ""}
                  onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                  min={form.fromDate || new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Please provide a reason for your leave request..."
                rows="4"
                value={form.reason || ""}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Leave Request"}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
