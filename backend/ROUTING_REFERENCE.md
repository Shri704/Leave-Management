# Backend routing reference (verified)

**Final working endpoint:** `POST /api/auth/login`

- Mount in app: `app.use("/api/auth", authRoutes)` → base `/api/auth`
- In auth routes: `router.post("/login", ...)` → path `/login`
- **No duplicate path** (e.g. no `/auth/auth/login`)

---

## server.js (full – routing lives in app.js)

```js
const app = require("./app");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Port configuration
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

---

## app.js (routing & middleware part)

```js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const holidayRoutes = require("./routes/holidayRoutes");
const adminRoutes = require("./routes/adminRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes – auth is mounted at /api/auth (login = /api/auth/login)
app.use("/api/auth", authRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/admin", adminRoutes);

// Health check route (for deployment)
app.get("/", (req, res) => {
  res.send("Leave Management System Backend is running 🚀");
});

// Error handling middleware (keep at end)
app.use(errorMiddleware);

module.exports = app;
```

---

## routes/authRoutes.js (file name is authRoutes.js, not auth.js)

```js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

/**
 * POST /api/auth/signup
 * Teacher signup only
 */
router.post("/signup", authController.signup);

/**
 * POST /api/auth/login
 * Login for TEACHER, HOD, DEAN, PRINCIPAL
 */
router.post("/login", authController.login);

module.exports = router;
```

---

If you still get 404 for `POST /api/auth/login`:

1. **Frontend URL** – Ensure the frontend calls exactly your Render backend URL + `/api/auth/login`, e.g.  
   `https://leave-management-0rfa.onrender.com/api/auth/login`,  
   and that `VITE_API_URL` is set to `https://leave-management-0rfa.onrender.com/api` (no `/auth/login`).
2. **Render** – Confirm the service is the Node/Express app and that the root URL returns the health message. No extra path prefix should be set unless you intentionally host the API under a subpath.
