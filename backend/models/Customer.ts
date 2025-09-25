import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICustomer extends Document {
  userId: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  company?: string;
  taxId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number cannot be more than 20 characters'],
  },
  address: {
    street: { type: String, maxlength: [200, 'Street address too long'] },
    city: { type: String, maxlength: [50, 'City name too long'] },
    state: { type: String, maxlength: [50, 'State name too long'] },
    zipCode: { type: String, maxlength: [20, 'Zip code too long'] },
    country: { type: String, maxlength: [50, 'Country name too long'] },
  },
  company: {
    type: String,
    maxlength: [100, 'Company name cannot be more than 100 characters'],
  },
  taxId: {
    type: String,
    maxlength: [50, 'Tax ID cannot be more than 50 characters'],
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters'],
  },
}, {
  timestamps: true,
});

// Index for faster queries
customerSchema.index({ userId: 1, email: 1 }, { unique: true });
customerSchema.index({ userId: 1, name: 1 });

// Don't return sensitive data
customerSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export default mongoose.model<ICustomer>('Customer', customerSchema);