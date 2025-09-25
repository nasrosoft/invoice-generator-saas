import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Routes
import authRoutes from '../routes/auth';
import invoiceRoutes from '../routes/invoices';
import customerRoutes from '../routes/customers';
import paymentRoutes from '../routes/payments';

app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection
const connectDB = async () => {
  try {
    // For testing, use local MongoDB first, then fall back to Atlas
    let mongoURI = 'mongodb://localhost:27017/invoice-generator';
    
    try {
      await mongoose.connect(mongoURI);
      console.log('✅ MongoDB connected successfully (Local)');
    } catch (localError) {
      console.log('⚠️ Local MongoDB not available, trying Atlas...');
      mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/invoice-generator';
      await mongoose.connect(mongoURI);
      console.log('✅ MongoDB connected successfully (Atlas)');
    }
    
    console.log('🗄️ Database:', mongoURI.includes('mongodb.net') ? 'MongoDB Atlas' : 'Local MongoDB');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    console.log('⚠️ Continuing without database connection for testing...');
    // Don't exit for testing purposes
    // process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer().catch(console.error);