# Campus Connect

Campus Connect is a full-stack web application designed to streamline campus activities and communication between students and administrators. It provides a centralized platform for managing events, clubs, notices, and academic notes, making campus life more organized and interactive.

## 🌟 Project Overview

Campus Connect bridges the gap between students and campus administration by offering:
- A modern, responsive web interface for both students and admins
- Secure authentication and role-based access
- Tools for event management, club memberships, notice sharing, and collaborative note uploads

## 🎯 What Does It Do?

### For Students
- **Sign Up / Login:** Register as a student and access all features after logging in.
- **View Events & Notices:** Stay updated with campus events and important notices.
- **Clubs:** Browse all clubs, send join requests, see request status, and leave clubs if desired.
- **Notes:** Upload and browse academic notes (as Google Drive links), organized by branch and semester.

### For Admins
- **Admin Registration:** Sign up as an admin using a special admin code.
- **Dashboard:** Access a dedicated dashboard to:
  - Create and manage events, notices, and clubs
  - Approve or reject student requests to join clubs
  - View all pending club requests

## ⚙️ How Does It Work?

### Tech Stack
- **Frontend:** React (Vite), React Router, Axios, React Icons
- **Backend:** Node.js, Express.js
- **Database:** Firebase Firestore
- **Authentication:** JWT (JSON Web Tokens), bcrypt for password hashing
- **Deployment:** Vercel (frontend), Render (backend)

### Core Functionality

#### Authentication & Authorization
- Users can sign up as students or admins (admin code required).
- JWT tokens are used for secure authentication.
- Role-based access ensures only admins can access admin features.

#### Events, Notices, and Clubs
- **Admins** can create events, notices, and clubs from their dashboard.
- **Students** can view all events, notices, and clubs.
- Club join requests are managed by admins (approve/reject).
- Membership status and request state are shown to students.

#### Notes Sharing
- Both admins and students can upload notes as Google Drive links.
- Notes are categorized by branch and semester for easy access.

#### Responsive UI/UX
- The app features a modern, dark-themed, mobile-friendly interface.
- Hamburger menu and navigation are optimized for mobile devices.

## 🚀 Getting Started

### 1. Clone the Repository
```sh
git clone https://github.com/your-username/Campus-Connect-Project.git
cd Campus-Connect-Project/test
```

### 2. Backend Setup
- Add your Firebase service account key to `Backend/config/`.
- Create a `.env` file in `Backend/` with your Firebase and JWT credentials.
- Install dependencies and start the server:
  ```sh
  cd Backend
  npm install
  npm start
  ```

### 3. Frontend Setup
- Update the API base URL in `Frontend/components/config.js` to your backend’s Render URL.
- Install dependencies and start the frontend:
  ```sh
  cd ../Frontend
  npm install
  npm run dev
  ```

### 4. Deployment
- Deploy the frontend to Vercel and the backend to Render.
- Make sure the frontend is configured to use the deployed backend URL.

## 📁 Project Structure

```
test/
  ├── Backend/
  │   ├── config/
  │   ├── routes/
  │   ├── server.js
  │   └── package.json
  └── Frontend/
      ├── components/
      ├── src/
      ├── App.jsx
      └── package.json
```

## 📝 License

This project is for educational purposes.

---

**For more details, see the code and comments in each folder. Feel free to open issues or contribute!** 
