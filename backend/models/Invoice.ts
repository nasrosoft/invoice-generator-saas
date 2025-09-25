import mongoose, { Document, Schema, Types } from 'mongoose';

interface IInvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface IInvoice extends Document {
  userId: Types.ObjectId;
  customerId: Types.ObjectId;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: IInvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  total: number;
  currency: string;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  notes?: string;
  terms?: string;
  template: 'default' | 'modern' | 'minimal' | 'professional';
  pdfPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceItemSchema = new Schema<IInvoiceItem>({
  description: {
    type: String,
    required: [true, 'Item description is required'],
    maxlength: [200, 'Description cannot be more than 200 characters'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.01, 'Quantity must be greater than 0'],
  },
  rate: {
    type: Number,
    required: [true, 'Rate is required'],
    min: [0, 'Rate must be greater than or equal to 0'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be greater than or equal to 0'],
  },
}, { _id: false });

const invoiceSchema = new Schema<IInvoice>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer ID is required'],
  },
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    unique: true,
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
  },
  items: {
    type: [invoiceItemSchema],
    required: [true, 'At least one item is required'],
    validate: {
      validator: function(items: IInvoiceItem[]) {
        return items.length > 0;
      },
      message: 'Invoice must have at least one item',
    },
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal must be greater than or equal to 0'],
  },
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate must be greater than or equal to 0'],
    max: [100, 'Tax rate must be less than or equal to 100'],
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount must be greater than or equal to 0'],
  },
  discountRate: {
    type: Number,
    default: 0,
    min: [0, 'Discount rate must be greater than or equal to 0'],
    max: [100, 'Discount rate must be less than or equal to 100'],
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount must be greater than or equal to 0'],
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total must be greater than or equal to 0'],
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'USD',
    maxlength: [3, 'Currency code must be 3 characters'],
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required'],
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
  },
  paidDate: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters'],
  },
  terms: {
    type: String,
    maxlength: [1000, 'Terms cannot be more than 1000 characters'],
  },
  template: {
    type: String,
    enum: ['default', 'modern', 'minimal', 'professional'],
    default: 'default',
  },
  pdfPath: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

// Index for faster queries
invoiceSchema.index({ userId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ userId: 1, status: 1 });
invoiceSchema.index({ userId: 1, dueDate: 1 });
invoiceSchema.index({ customerId: 1 });

// Calculate amounts before saving
invoiceSchema.pre('save', function(next) {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((sum, item) => {
    item.amount = item.quantity * item.rate;
    return sum + item.amount;
  }, 0);

  // Calculate tax amount
  this.taxAmount = (this.subtotal * this.taxRate) / 100;

  // Calculate discount amount
  this.discountAmount = (this.subtotal * this.discountRate) / 100;

  // Calculate total
  this.total = this.subtotal + this.taxAmount - this.discountAmount;

  next();
});

// Update status based on dates
invoiceSchema.pre('save', function(next) {
  if (this.paidDate && this.status !== 'paid') {
    this.status = 'paid';
  } else if (!this.paidDate && this.status === 'paid') {
    this.paidDate = undefined;
  } else if (this.dueDate < new Date() && this.status === 'sent' && !this.paidDate) {
    this.status = 'overdue';
  }
  next();
});

// Don't return sensitive data
invoiceSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export default mongoose.model<IInvoice>('Invoice', invoiceSchema);