# Blog-app

A full-stack blog application built with a **MERN (MongoDB, Express, React, Node.js)** architecture. This project enables users to register, authenticate, and interact with posts, featuring rich text editing, image uploads, and social login.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [License](#license)

---

## Features

- User authentication (local & Google OAuth)
- JWT-based authorization
- Create, edit, delete, and view blog posts
- Rich text editor for posts
- Image uploads (Cloudinary integration)
- Responsive frontend with React, Redux, TailwindCSS
- Form validation with Formik and Yup
- API communication with Axios
- Route protection and navigation (React Router)
- State synchronization (Redux Toolkit, React Query)

---

## Tech Stack

**Frontend:**
- React
- React Router DOM
- Redux Toolkit
- React Query
- TailwindCSS
- Formik & Yup (validation)
- React Quill (rich text editing)
- Axios

**Backend:**
- Node.js
- Express
- MongoDB (via Mongoose)
- Passport (local, JWT, Google OAuth)
- Multer & Cloudinary (file/image upload)
- dotenv (env management)
- bcryptjs (password hashing)
- CORS, cookie-parser

---

## Monorepo Structure

```
Blog-app/
│
├── backend/          # Express API and server files
│   └── package.json
│
├── client/           # React frontend
│   └── package.json
│
└── README.md         # (You are here)
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm (or yarn)
- MongoDB instance (local or cloud)
- Cloudinary account (for image uploads)

---

### Backend Setup

```bash
cd backend
npm install
# or yarn
```

- Configure environment variables (see below)
- Start the backend server:

```bash
npm start
```
The server runs on the port specified in your `.env` file (default: 5000).

---

### Frontend Setup

```bash
cd client
npm install
# or yarn
```

- Start the development server:

```bash
npm run dev
```
The React app runs on the port specified by Vite (default: 5173).

---

## Environment Variables

### Backend (`backend/.env`)

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Frontend (`client/.env`)

Add any API URLs or public keys needed.

---

## Scripts

### Backend

- `npm start` — Start Express server
- `npm test` — (No tests specified)

### Frontend

- `npm run dev` — Start Vite dev server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint

---

## License

This project is provided under the ISC License.

---

## Author

- [Dheeraj Singh](https://github.com/dheerajsingh9334)

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## Acknowledgements

- [React](https://react.dev/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Cloudinary](https://cloudinary.com/)
- [Passport.js](http://www.passportjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
