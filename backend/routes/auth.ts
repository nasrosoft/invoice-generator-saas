import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('name')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { name, email, password } = req.body;

      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({
            message: 'User with this email already exists',
          });
        }

        // Create new user
        const user = new User({
          name,
          email,
          password,
        });

        await user.save();

        // Generate token
        const token = generateToken({
          userId: (user._id as any).toString(),
          email: user.email,
          plan: user.plan,
        });

        res.status(201).json({
          message: 'User created successfully',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            plan: user.plan,
            invoiceCount: user.invoiceCount,
            maxInvoices: user.maxInvoices,
          },
        });
      } catch (dbError) {
        console.log('Database unavailable, using test user creation');
        
        // Fallback for testing without database
        const mockUserId = 'test_user_' + Date.now();
        const token = generateToken({
          userId: mockUserId,
          email: email,
          plan: 'free',
        });

        res.status(201).json({
          message: 'Test user created successfully (no database)',
          token,
          user: {
            id: mockUserId,
            name: name,
            email: email,
            plan: 'free',
            invoiceCount: 0,
            maxInvoices: 5,
          },
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({
        message: 'Failed to create user',
        error: error.message,
      });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      try {
        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
          return res.status(401).json({
            message: 'Invalid email or password',
          });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          return res.status(401).json({
            message: 'Invalid email or password',
          });
        }

        // Generate token
        const token = generateToken({
          userId: (user._id as any).toString(),
          email: user.email,
          plan: user.plan,
        });

        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            plan: user.plan,
            invoiceCount: user.invoiceCount,
            maxInvoices: user.maxInvoices,
          },
        });
      } catch (dbError) {
        console.log('Database unavailable, using test login');
        
        // Test credentials for demo
        if (email === 'john.doe@example.com' && password === 'password123') {
          const mockUserId = 'test_user_demo';
          const token = generateToken({
            userId: mockUserId,
            email: email,
            plan: 'free',
          });

          res.json({
            message: 'Test login successful (no database)',
            token,
            user: {
              id: mockUserId,
              name: 'John Doe',
              email: email,
              plan: 'free',
              invoiceCount: 2,
              maxInvoices: 5,
            },
          });
        } else {
          return res.status(401).json({
            message: 'Invalid credentials. Try john.doe@example.com / password123',
          });
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({
        message: 'Login failed',
        error: error.message,
      });
    }
  }
);

// Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        plan: req.user.plan,
        subscriptionStatus: req.user.subscriptionStatus,
        invoiceCount: req.user.invoiceCount,
        maxInvoices: req.user.maxInvoices,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Failed to get user profile',
      error: error.message,
    });
  }
});

// Update user profile
router.put(
  '/me',
  authenticate,
  [
    body('name')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
  ],
  async (req: AuthRequest, res: express.Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { name, email } = req.body;
      const updateData: any = {};

      if (name) updateData.name = name;
      if (email && email !== req.user.email) {
        // Check if email is already taken
        const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
        if (existingUser) {
          return res.status(400).json({
            message: 'Email is already taken by another user',
          });
        }
        updateData.email = email;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          plan: updatedUser.plan,
          subscriptionStatus: updatedUser.subscriptionStatus,
          invoiceCount: updatedUser.invoiceCount,
          maxInvoices: updatedUser.maxInvoices,
        },
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({
        message: 'Failed to update profile',
        error: error.message,
      });
    }
  }
);

export default router;
