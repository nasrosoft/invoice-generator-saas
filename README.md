# 🧾 Invoice Generator SaaS

A modern, full-stack Invoice Generator SaaS application built with **React**, **Node.js**, **TypeScript**, and **MongoDB**. Create, manage, and track invoices with a beautiful, responsive interface powered by Semantic UI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-%3E%3D18.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-%3E%3D4.0.0-blue.svg)

## ✨ Features

### 🎨 Frontend
- **Modern UI**: Built with Semantic UI React for a professional, responsive design
- **TypeScript**: Full type safety and enhanced developer experience
- **Authentication**: Secure JWT-based authentication with protected routes
- **Invoice Management**: Create, edit, view, and delete invoices with real-time calculations
- **Customer Management**: Complete CRUD operations for customer data
- **Dashboard**: Overview of invoices, revenue, and business metrics
- **PDF Generation**: Download invoices as professionally formatted PDFs
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Loading States**: Beautiful loading animations and placeholders
- **Toast Notifications**: User-friendly success/error messages

### 🔧 Backend
- **RESTful API**: Clean, well-documented API endpoints
- **TypeScript**: Type-safe backend development
- **MongoDB Integration**: Robust data persistence with Mongoose ODM
- **JWT Authentication**: Secure user authentication and authorization
- **Input Validation**: Comprehensive request validation with express-validator
- **Error Handling**: Centralized error handling and logging
- **Security**: CORS, Helmet, and rate limiting for enhanced security
- **PDF Generation**: Server-side PDF creation with Puppeteer
- **Subscription Management**: Support for different pricing plans

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type safety and better developer experience
- **Semantic UI React** - Professional UI component library
- **React Router** - Client-side routing
- **Axios** - HTTP client with interceptors
- **React Hot Toast** - Beautiful toast notifications
- **Date-fns** - Date manipulation and formatting

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe backend development
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation
- **Puppeteer** - PDF generation
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

## 📦 Project Structure

```
invoice-generator-saas/
├── frontend/                  # React TypeScript frontend
│   ├── public/               # Static files
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context providers
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   └── App.tsx          # Main app component
│   ├── package.json
│   └── tsconfig.json
├── backend/                  # Node.js TypeScript backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions
│   │   └── server.ts        # Express server setup
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/invoice-generator-saas.git
cd invoice-generator-saas
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

#### Backend Environment Variables (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database - MongoDB Atlas or Local
MONGODB_URI=mongodb://localhost:27017/invoice-generator
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/invoice-generator

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Frontend URL
CLIENT_URL=http://localhost:3000
```

#### Start Backend Server
```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

The frontend will start on `http://localhost:3000`

## 🎯 Usage

### Demo Credentials
For testing purposes, you can use these credentials:
- **Email**: `john.doe@example.com`
- **Password**: `password123`

### Key Features Demo

1. **Authentication**
   - Register a new account or login with demo credentials
   - JWT token automatically handles session management

2. **Dashboard**
   - View invoice statistics and recent activity
   - Quick access to create new invoices

3. **Invoice Management**
   - Create invoices with line items and automatic calculations
   - Edit existing invoices
   - Track invoice status (Draft, Sent, Paid, Overdue)
   - Download invoices as PDF

4. **Customer Management**
   - Add and edit customer information
   - Complete address management
   - Customer search and filtering

5. **Settings**
   - Update profile information
   - Configure invoice defaults
   - Manage notification preferences

## 🎨 UI Components

The application includes a comprehensive set of Semantic UI components:

- **Loading States**: Various loading spinners and placeholders
- **Forms**: Validated forms with error handling
- **Tables**: Sortable, filterable data tables
- **Modals**: Confirmation dialogs and forms
- **Navigation**: Responsive sidebar navigation
- **Cards**: Information cards with statistics
- **Buttons**: Loading states and various styles

### Loading Components Demo
Visit `/loading-demo` (when logged in) to see all available loading components.

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full-featured experience with sidebar navigation
- **Tablet**: Adapted layout with collapsible navigation
- **Mobile**: Touch-optimized interface with mobile-first design

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Server-side validation for all endpoints
- **CORS Protection**: Configured for secure cross-origin requests
- **Rate Limiting**: Protection against API abuse
- **Helmet**: Security headers for enhanced protection

## 📈 Future Enhancements

- [ ] Email notifications for invoice status changes
- [ ] Stripe integration for subscription payments
- [ ] Multi-tenant support for agencies
- [ ] Custom invoice templates
- [ ] Expense tracking
- [ ] Advanced reporting and analytics
- [ ] Mobile app (React Native)
- [ ] API webhook support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - Initial work - [Your GitHub](https://github.com/YOUR_USERNAME)

## 🙏 Acknowledgments

- [Semantic UI React](https://react.semantic-ui.com/) for the beautiful UI components
- [MongoDB](https://www.mongodb.com/) for the database platform
- [React](https://reactjs.org/) for the frontend framework
- [Node.js](https://nodejs.org/) for the backend runtime

## 📞 Support

If you have any questions or need help with setup, please open an issue on GitHub.

---

⭐ **Star this repository if you found it helpful!**