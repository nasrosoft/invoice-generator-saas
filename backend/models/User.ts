import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'business';
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'inactive' | 'past_due' | 'canceled';
  invoiceCount: number;
  maxInvoices: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: null,
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'business'],
    default: 'free',
  },
  stripeCustomerId: {
    type: String,
    default: null,
  },
  subscriptionId: {
    type: String,
    default: null,
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'past_due', 'canceled'],
    default: 'inactive',
  },
  invoiceCount: {
    type: Number,
    default: 0,
  },
  maxInvoices: {
    type: Number,
    default: 5, // Free tier limit
  },
}, {
  timestamps: true,
});

// Index for faster queries (email index is created by unique: true)
userSchema.index({ stripeCustomerId: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Update maxInvoices based on plan
userSchema.pre('save', function(next) {
  if (this.isModified('plan')) {
    switch (this.plan) {
      case 'free':
        this.maxInvoices = 5;
        break;
      case 'pro':
        this.maxInvoices = -1; // Unlimited
        break;
      case 'business':
        this.maxInvoices = -1; // Unlimited
        break;
    }
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Don't return password and sensitive data
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export default mongoose.model<IUser>('User', userSchema);