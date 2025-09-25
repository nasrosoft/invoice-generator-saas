import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest, checkInvoiceLimit } from '../middleware/auth';
import {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  generateInvoicePDFController,
  duplicateInvoice
} from '../controllers/invoiceController';

const router = express.Router();

// Validation rules for invoice creation
const invoiceValidation = [
  body('customerId')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isMongoId()
    .withMessage('Invalid customer ID'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.description')
    .notEmpty()
    .withMessage('Item description is required')
    .isLength({ max: 200 })
    .withMessage('Item description must be less than 200 characters'),
  body('items.*.quantity')
    .isNumeric()
    .withMessage('Item quantity must be a number')
    .custom(value => value > 0)
    .withMessage('Item quantity must be greater than 0'),
  body('items.*.rate')
    .isNumeric()
    .withMessage('Item rate must be a number')
    .custom(value => value >= 0)
    .withMessage('Item rate must be greater than or equal to 0'),
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('taxRate')
    .optional()
    .isNumeric()
    .withMessage('Tax rate must be a number')
    .custom(value => value >= 0 && value <= 100)
    .withMessage('Tax rate must be between 0 and 100'),
  body('discountRate')
    .optional()
    .isNumeric()
    .withMessage('Discount rate must be a number')
    .custom(value => value >= 0 && value <= 100)
    .withMessage('Discount rate must be between 0 and 100'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  body('terms')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Terms must be less than 1000 characters')
];

// Update validation (similar but optional fields)
const invoiceUpdateValidation = [
  body('customerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid customer ID'),
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one item is required if items are provided'),
  body('items.*.description')
    .optional()
    .notEmpty()
    .withMessage('Item description is required')
    .isLength({ max: 200 })
    .withMessage('Item description must be less than 200 characters'),
  body('items.*.quantity')
    .optional()
    .isNumeric()
    .withMessage('Item quantity must be a number')
    .custom(value => value > 0)
    .withMessage('Item quantity must be greater than 0'),
  body('items.*.rate')
    .optional()
    .isNumeric()
    .withMessage('Item rate must be a number')
    .custom(value => value >= 0)
    .withMessage('Item rate must be greater than or equal to 0'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('taxRate')
    .optional()
    .isNumeric()
    .withMessage('Tax rate must be a number')
    .custom(value => value >= 0 && value <= 100)
    .withMessage('Tax rate must be between 0 and 100'),
  body('discountRate')
    .optional()
    .isNumeric()
    .withMessage('Discount rate must be a number')
    .custom(value => value >= 0 && value <= 100)
    .withMessage('Discount rate must be between 0 and 100'),
  body('status')
    .optional()
    .isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
    .withMessage('Invalid status'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  body('terms')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Terms must be less than 1000 characters')
];

// Routes

// GET /api/invoices - Get all invoices with filtering and pagination
router.get('/', authenticate, getAllInvoices);

// GET /api/invoices/:id - Get specific invoice
router.get('/:id', authenticate, getInvoiceById);

// POST /api/invoices - Create new invoice
router.post('/', authenticate, checkInvoiceLimit, invoiceValidation, createInvoice);

// PUT /api/invoices/:id - Update invoice
router.put('/:id', authenticate, invoiceUpdateValidation, updateInvoice);

// DELETE /api/invoices/:id - Delete invoice
router.delete('/:id', authenticate, deleteInvoice);

// GET /api/invoices/:id/pdf - Generate PDF
router.get('/:id/pdf', authenticate, generateInvoicePDFController);

// POST /api/invoices/:id/duplicate - Duplicate invoice
router.post('/:id/duplicate', authenticate, checkInvoiceLimit, duplicateInvoice);

// POST /api/invoices/:id/send - Mark invoice as sent (future feature)
router.post('/:id/send', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    // This will be implemented when email functionality is added
    res.json({ message: 'Send invoice feature coming soon' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to send invoice', error: error.message });
  }
});

export default router;
