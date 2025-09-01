# WisdomShare - MERN Blog Platform
*Share Knowledge, Inspire Growth*

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18-blue)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/express-4-lightgrey)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/mongoDB-6-green)](https://mongodb.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dheerajsingh9334/Blog-app/pulls)

🚀 **Live Demo**: [https://blog-app-sigma-tan.vercel.app/](https://blog-app-sigma-tan.vercel.app/)

🔧 **Admin Dashboard**: [https://blog-app-sigma-tan.vercel.app/admin/dashboard](https://blog-app-sigma-tan.vercel.app/admin/dashboard)

A modern, full-stack blog platform built with the MERN stack. Features include user authentication, subscription plans, advanced analytics, admin dashboard, email verification, and much more.

## ✨ Features

### 🎯 For Users
- **Authentication**: Login/Register with email verification and Google OAuth
- **Post Management**: Create, edit, and schedule posts with rich text editor
- **Subscription Plans**: Free, Premium, and Pro tiers with different limits
- **Social Features**: Follow users, like posts, comment, and save posts
- **Analytics**: View post performance and engagement metrics
- **Dark Mode**: Complete dark/light theme support
- **Responsive Design**: Works perfectly on all devices

### 👨‍💼 For Admins
- **Dashboard Analytics**: User growth, post trends, and engagement insights
- **User Management**: View, ban/unban users, assign plans
- **Content Moderation**: Manage posts, comments, and categories
- **Notification System**: Send broadcasts and manage notifications
- **Plan Management**: Create and modify subscription plans

### 💳 Subscription Plans

| Feature | Free Plan | Premium Plan | Pro Plan |
|---------|-----------|--------------|----------|
| Posts per month | 30 | 100 | 300 |
| Characters per post | 3,000 | 10,000 | 50,000 |
| Categories | 1 | Multiple | Multiple |
| Advanced Editor | ❌ | ✅ | ✅ |
| Analytics | Basic | ✅ | ✅ |
| Reader Analytics | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |
| **Price** | **Free** | **$29/month** | **$99/month** |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration (see Environment Variables section)

npm start
```

The API server will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The web application will run on `http://localhost:5173`

## 🔧 Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database
MONGO_URL=mongodb://localhost:27017/mern_blog

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Client URL
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 📁 Project Structure

```
mern-blog/
├── backend/                 # Express.js API
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Custom middlewares
│   ├── models/            # MongoDB models
│   ├── router/            # API routes
│   ├── scripts/           # Database seeders
│   ├── utils/             # Utility functions
│   └── server.js          # Main server file
├── frontend/              # React.js application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── APIServices/   # API integration
│   │   ├── redux/         # State management
│   │   ├── hooks/         # Custom hooks
│   │   ├── contexts/      # React contexts
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── diagrams/              # Architecture diagrams
```

## 🛠️ Available Scripts

### Backend Scripts
```bash
npm start                  # Start the server
npm run dev               # Start with nodemon
npm run seed:plans        # Seed subscription plans
npm run create:admin      # Create admin user
```

### Frontend Scripts
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

## 🏗️ Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database
- **JWT** - Authentication
- **Stripe** - Payment processing
- **Cloudinary** - Image hosting
- **Nodemailer** - Email services
- **Passport.js** - Google OAuth

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Redux Toolkit** - State management
- **React Query** - Server state
- **React Router** - Navigation
- **React Hook Form** - Form handling
- **Recharts** - Data visualization

## 🔐 Authentication

The platform supports multiple authentication methods:

1. **Email/Password**: Traditional registration with email verification
2. **Google OAuth**: Quick login with Google account
3. **JWT Tokens**: Secure session management

## 💰 Payment Integration

Stripe integration for subscription management:
- Secure payment processing
- Subscription management
- Plan upgrades/downgrades
- Billing history


## 📊 Analytics & Insights

### User Analytics
- Post views and engagement
- Follower growth
- Content performance
- Reading analytics

### Admin Analytics
- User growth metrics
- Content statistics
- Platform usage insights
- Revenue tracking

## 🔒 Security Features

- **Input Validation**: Comprehensive validation using Joi/Yup
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured for production
- **JWT Security**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Email Verification**: Required for account activation

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Render/Railway/Heroku)
1. Set environment variables
2. Deploy the backend/ folder
3. Update CORS settings for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Dheeraj Singh**
- GitHub: [@dheerajsingh9334](https://github.com/dheerajsingh9334)
- Email: dheerajsingh9334@gmail.com

## 🙏 Acknowledgments

- Built with love using the MERN stack
- Icons by [React Icons](https://react-icons.github.io/react-icons/)
- UI components inspired by modern design principles
- Special thanks to the open source community

---

⭐ **If you found this project helpful, please give it a star!** ⭐


