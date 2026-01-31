const app = require("./app");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const adminController = require("./controllers/adminController");

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect DB, seed authority accounts (HOD, DEAN, PRINCIPAL), then start server
// This ensures authority users exist before any login request is accepted
connectDB()
  .then(() =>
    adminController.createAuthorities().catch((err) => {
      console.error("Authority seed error:", err.message);
      // Server still starts – you can call POST /api/admin/create-authorities manually
    })
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Startup error (DB):", err);
    process.exit(1);
  });
