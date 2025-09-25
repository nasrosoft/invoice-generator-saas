import express from 'express';
import { body, validationResult } from 'express-validator';
import Customer from '../models/Customer';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all customers for the authenticated user
router.get('/', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const customers = await Customer.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      customers,
      count: customers.length,
    });
  } catch (error: any) {
    console.error('Get customers error:', error);
    res.status(500).json({
      message: 'Failed to fetch customers',
      error: error.message,
    });
  }
});

// Get a specific customer
router.get('/:id', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const customer = await Customer.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ customer });
  } catch (error: any) {
    console.error('Get customer error:', error);
    res.status(500).json({
      message: 'Failed to fetch customer',
      error: error.message,
    });
  }
});

// Create a new customer
router.post(
  '/',
  authenticate,
  [
    body('name')
      .notEmpty()
      .isLength({ max: 100 })
      .withMessage('Customer name is required and must be less than 100 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('phone')
      .optional()
      .isLength({ max: 20 })
      .withMessage('Phone number must be less than 20 characters'),
    body('company')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Company name must be less than 100 characters'),
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

      // Check if customer with same email already exists for this user
      const existingCustomer = await Customer.findOne({
        userId: req.user._id,
        email: req.body.email,
      });

      if (existingCustomer) {
        return res.status(400).json({
          message: 'A customer with this email already exists',
        });
      }

      const customer = new Customer({
        ...req.body,
        userId: req.user._id,
      });

      await customer.save();

      res.status(201).json({
        message: 'Customer created successfully',
        customer,
      });
    } catch (error: any) {
      console.error('Create customer error:', error);
      res.status(500).json({
        message: 'Failed to create customer',
        error: error.message,
      });
    }
  }
);

// Update a customer
router.put(
  '/:id',
  authenticate,
  [
    body('name')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Customer name must be between 1 and 100 characters'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('phone')
      .optional()
      .isLength({ max: 20 })
      .withMessage('Phone number must be less than 20 characters'),
    body('company')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Company name must be less than 100 characters'),
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

      // Check if customer with same email already exists for this user (excluding current customer)
      if (req.body.email) {
        const existingCustomer = await Customer.findOne({
          userId: req.user._id,
          email: req.body.email,
          _id: { $ne: req.params.id },
        });

        if (existingCustomer) {
          return res.status(400).json({
            message: 'A customer with this email already exists',
          });
        }
      }

      const customer = await Customer.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
        { new: true, runValidators: true }
      );

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      res.json({
        message: 'Customer updated successfully',
        customer,
      });
    } catch (error: any) {
      console.error('Update customer error:', error);
      res.status(500).json({
        message: 'Failed to update customer',
        error: error.message,
      });
    }
  }
);

// Delete a customer
router.delete('/:id', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      message: 'Failed to delete customer',
      error: error.message,
    });
  }
});

export default router;
