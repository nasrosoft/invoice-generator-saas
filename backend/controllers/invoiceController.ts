import { Response } from 'express';
import { validationResult } from 'express-validator';
import Invoice from '../models/Invoice';
import Customer from '../models/Customer';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { generateInvoiceNumber, calculateInvoiceTotals, generateInvoicePDF } from '../utils/invoiceUtils';

// Get all invoices for the authenticated user
export const getAllInvoices = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { page = 1, limit = 10, status, search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: any = { userId: req.user._id };
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Get invoices with customer info populated
    const invoices = await Invoice.find(filter)
      .populate('customerId', 'name email company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Invoice.countDocuments(filter);

    // Calculate summary stats
    const stats = await Invoice.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    const summary = {
      total: 0,
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      totalRevenue: 0,
      paidRevenue: 0
    };

    stats.forEach(stat => {
      summary.total += stat.count;
      summary[stat._id as keyof typeof summary] = stat.count;
      
      if (stat._id === 'paid') {
        summary.paidRevenue += stat.totalAmount;
      }
      summary.totalRevenue += stat.totalAmount;
    });

    res.json({
      invoices,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      },
      summary
    });
  } catch (error: any) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      message: 'Failed to fetch invoices',
      error: error.message
    });
  }
};

// Get a specific invoice
export const getInvoiceById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('customerId');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ invoice });
  } catch (error: any) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      message: 'Failed to fetch invoice',
      error: error.message
    });
  }
};

// Create a new invoice
export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      customerId,
      items,
      dueDate,
      taxRate = 0,
      discountRate = 0,
      currency = 'USD',
      notes,
      terms
    } = req.body;

    // Verify customer belongs to user
    const customer = await Customer.findOne({
      _id: customerId,
      userId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Calculate totals
    const totals = calculateInvoiceTotals(items, taxRate, discountRate);

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber((req.user._id as any).toString());

    // Create invoice
    const invoice = new Invoice({
      userId: req.user._id,
      customerId,
      invoiceNumber,
      items: items.map((item: any) => ({
        ...item,
        amount: item.quantity * item.rate
      })),
      subtotal: totals.subtotal,
      taxRate,
      taxAmount: totals.taxAmount,
      discountRate,
      discountAmount: totals.discountAmount,
      total: totals.total,
      currency,
      dueDate: new Date(dueDate),
      notes,
      terms
    });

    await invoice.save();

    // Update user invoice count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { invoiceCount: 1 }
    });

    // Populate customer data for response
    await invoice.populate('customerId');

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice
    });
  } catch (error: any) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      message: 'Failed to create invoice',
      error: error.message
    });
  }
};

// Update an invoice
export const updateInvoice = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      customerId,
      items,
      dueDate,
      taxRate,
      discountRate,
      currency,
      notes,
      terms,
      status
    } = req.body;

    // Find the invoice
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Verify customer if provided
    if (customerId && customerId !== invoice.customerId.toString()) {
      const customer = await Customer.findOne({
        _id: customerId,
        userId: req.user._id
      });

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      invoice.customerId = customerId;
    }

    // Update items and recalculate if provided
    if (items) {
      const totals = calculateInvoiceTotals(items, taxRate || invoice.taxRate, discountRate || invoice.discountRate);
      
      invoice.items = items.map((item: any) => ({
        ...item,
        amount: item.quantity * item.rate
      }));
      
      invoice.subtotal = totals.subtotal;
      invoice.taxAmount = totals.taxAmount;
      invoice.discountAmount = totals.discountAmount;
      invoice.total = totals.total;
    }

    // Update other fields
    if (dueDate) invoice.dueDate = new Date(dueDate);
    if (taxRate !== undefined) invoice.taxRate = taxRate;
    if (discountRate !== undefined) invoice.discountRate = discountRate;
    if (currency) invoice.currency = currency;
    if (notes !== undefined) invoice.notes = notes;
    if (terms !== undefined) invoice.terms = terms;
    if (status) {
      invoice.status = status;
      if (status === 'paid' && !invoice.paidDate) {
        invoice.paidDate = new Date();
      } else if (status !== 'paid') {
        invoice.paidDate = undefined;
      }
    }

    await invoice.save();
    await invoice.populate('customerId');

    res.json({
      message: 'Invoice updated successfully',
      invoice
    });
  } catch (error: any) {
    console.error('Update invoice error:', error);
    res.status(500).json({
      message: 'Failed to update invoice',
      error: error.message
    });
  }
};

// Delete an invoice
export const deleteInvoice = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Update user invoice count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { invoiceCount: -1 }
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error: any) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      message: 'Failed to delete invoice',
      error: error.message
    });
  }
};

// Generate PDF for an invoice
export const generateInvoicePDFController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('customerId');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const customer = invoice.customerId as any;
    const pdfBuffer = await generateInvoicePDF(invoice, req.user, customer);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Generate PDF error:', error);
    res.status(500).json({
      message: 'Failed to generate PDF',
      error: error.message
    });
  }
};

// Duplicate an invoice
export const duplicateInvoice = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const originalInvoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!originalInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Generate new invoice number
    const invoiceNumber = await generateInvoiceNumber((req.user._id as any).toString());

    // Create duplicate with updated fields
    const duplicateData = originalInvoice.toObject();
    delete (duplicateData as any)._id;
    delete (duplicateData as any).__v;
    
    const newInvoice = new Invoice({
      ...duplicateData,
      invoiceNumber,
      status: 'draft',
      paidDate: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newInvoice.save();

    // Update user invoice count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { invoiceCount: 1 }
    });

    await newInvoice.populate('customerId');

    res.status(201).json({
      message: 'Invoice duplicated successfully',
      invoice: newInvoice
    });
  } catch (error: any) {
    console.error('Duplicate invoice error:', error);
    res.status(500).json({
      message: 'Failed to duplicate invoice',
      error: error.message
    });
  }
};