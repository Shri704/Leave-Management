# Leave Management System

A comprehensive full-stack leave management system with role-based access control, sequential approval workflow, and email notifications.

## 🏗️ Architecture

- **Backend**: Node.js + Express.js + MongoDB
- **Frontend**: Two separate React apps (Vite)
  - Teacher Portal
  - Authority Portal (HOD, Dean, Principal)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Authentication**: JWT
- **Email**: Nodemailer (Gmail SMTP)

## 📋 Features

### Authentication & Authorization
- Teachers can sign up and log in
- HOD, Dean, and Principal have fixed credentials (no signup)
- JWT-based authentication with role-based access control
- Persistent login using localStorage

### Leave Management
- Four leave types: CL (Casual Leave), SL (Sick Leave), EL (Earned Leave), OD (On Duty)
- Holiday exclusion from leave calculations
- Automatic rejection of leave applications on holidays
- Accurate leave day count after excluding holidays

### Approval Workflow (Sequential)
1. Teacher applies leave → Status: `PENDING_HOD`
2. HOD approves → Forwarded to Dean (email notification sent)
3. Dean approves → Forwarded to Principal (email notification sent)
4. Principal approves → Status: `APPROVED` (email notification sent to teacher)
5. Any rejection → Status: `REJECTED` (email notification sent to teacher)

### Email Notifications
- Automatic email notifications at each approval step
- HTML-formatted emails with professional templates
- Backend-controlled email sending (frontend never sends emails)

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Gmail account with App Password for email notifications

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A strong secret key
   - `EMAIL`: Your Gmail address
   - `EMAIL_PASSWORD`: Gmail App Password (not regular password)

4. **Create authority accounts**
   ```bash
   # Start the server first, then make a POST request to:
   # POST http://localhost:5000/api/admin/create-authorities
   # Or use Postman/curl:
   curl -X POST http://localhost:5000/api/admin/create-authorities
   ```
   
   This creates:
   - HOD: `hod.collegevdit@gmail.com` / `hodc@#1234`
   - Dean: `dean.collegevdit@gmail.com` / `deanc@#1234`
   - Principal: `principal.collegevdit@gmail.com` / `principalc@#1234`

5. **Start the backend server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

### Teacher Portal Setup

1. **Navigate to teacher frontend directory**
   ```bash
   cd teacher-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Ensure `VITE_API_URL` points to your backend URL.

4. **Start development server**
   ```bash
   npm run dev
   ```
   Portal runs on `http://localhost:5173` (or next available port)

### Authority Portal Setup

1. **Navigate to authority frontend directory**
   ```bash
   cd authority-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Ensure `VITE_API_URL` points to your backend URL.

4. **Start development server**
   ```bash
   npm run dev
   ```
   Portal runs on `http://localhost:5174` (or next available port)

## 📁 Project Structure

```
leave-management-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, email config
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, role, error middleware
│   │   ├── models/          # MongoDB models (User, Leave, Holiday)
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (mail, calculator)
│   │   ├── utils/           # Constants, helpers
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── .env
│   └── package.json
│
├── teacher-frontend/
│   ├── src/
│   │   ├── api/             # API calls
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth context
│   │   ├── pages/           # Page components
│   │   └── main.jsx
│   ├── .env
│   └── package.json
│
└── authority-frontend/
    ├── src/
    │   ├── api/             # API calls
    │   ├── components/      # Reusable components
    │   ├── context/         # Auth context
    │   ├── pages/           # Page components
    │   └── main.jsx
    ├── .env
    └── package.json
```

## 🔑 Default Credentials

### Authority Accounts (Created via API)
- **HOD**: `hod.collegevdit@gmail.com` / `hodc@#1234`
- **Dean**: `dean.collegevdit@gmail.com` / `deanc@#1234`
- **Principal**: `principal.collegevdit@gmail.com` / `principalc@#1234`

### Teacher Accounts
- Teachers must sign up through the Teacher Portal

## 📧 Email Configuration

To use Gmail SMTP:

1. Enable 2-Step Verification on your Google Account
2. Generate an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the generated password
3. Use this App Password in `EMAIL_PASSWORD` (not your regular password)

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Teacher signup
- `POST /api/auth/login` - Login (all roles)

### Leaves
- `POST /api/leaves` - Apply leave (Teacher only)
- `GET /api/leaves/pending` - Get pending leaves (Authority)
- `PUT /api/leaves/approve/:id` - Approve leave (Authority)
- `PUT /api/leaves/reject/:id` - Reject leave (Authority)
- `GET /api/leaves/my-leaves` - Get teacher's leaves
- `GET /api/leaves/statistics` - Get leave statistics (Teacher)

### Holidays
- `GET /api/holidays` - Get all holidays

### Admin
- `POST /api/admin/create-authorities` - Create authority accounts

## 🚢 Deployment

### Backend (Render)
1. Connect your GitHub repository
2. Set build command: `cd backend && npm install`
3. Set start command: `cd backend && npm start`
4. Add environment variables in Render dashboard:
   - `MONGO_URI`, `JWT_SECRET`, `EMAIL`, `EMAIL_PASSWORD` (Gmail App Password – required for mail to send)

### Frontend (Vercel)
1. Deploy `teacher-frontend`:
   - Connect repository
   - Set root directory: `teacher-frontend`
   - Add environment variable: `VITE_API_URL`
2. Deploy `authority-frontend`:
   - Connect repository
   - Set root directory: `authority-frontend`
   - Add environment variable: `VITE_API_URL`

## 🛠️ Development

### Adding Holidays
Use MongoDB shell or a tool like MongoDB Compass:
```javascript
db.holidays.insertMany([
  { name: "New Year", date: new Date("2026-01-01"), type: "National" },
  { name: "Independence Day", date: new Date("2026-08-15"), type: "National" }
  // Add more holidays...
])
```

### Testing the System
1. Create a teacher account via Teacher Portal
2. Apply for leave
3. Login as HOD → Approve
4. Login as Dean → Approve
5. Login as Principal → Approve
6. Check teacher email for approval notification

## 📝 Notes

- Holidays are excluded from leave day calculations
- Leave applications on holidays are automatically rejected
- Only one authority can see a leave request at a time (sequential workflow)
- Email notifications are sent automatically at each step
- JWT tokens expire after 1 day

## 🤝 Contributing

This is a production-ready system. Feel free to extend it with additional features like:
- Leave cancellation
- Leave history filters
- Export leave reports
- Calendar view
- Notifications dashboard

## 📄 License

This project is open source and available for educational and commercial use.
