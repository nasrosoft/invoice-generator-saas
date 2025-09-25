import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import User, { IUser } from '../models/User';

// Extend Request interface to include user
export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    // Verify the token
    const decoded: JWTPayload = verifyToken(token);
    
    // Find the user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error: any) {
    if (error.message === 'Token has expired') {
      res.status(401).json({ message: 'Token has expired' });
    } else if (error.message === 'Invalid token') {
      res.status(401).json({ message: 'Invalid token' });
    } else {
      console.error('Authentication error:', error);
      res.status(500).json({ message: 'Authentication failed' });
    }
  }
};

export const requirePlan = (allowedPlans: Array<'free' | 'pro' | 'business'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!allowedPlans.includes(req.user.plan)) {
      res.status(403).json({ 
        message: 'Upgrade your plan to access this feature',
        currentPlan: req.user.plan,
        requiredPlans: allowedPlans
      });
      return;
    }

    next();
  };
};

export const checkInvoiceLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Unlimited for pro and business plans
    if (req.user.plan === 'pro' || req.user.plan === 'business') {
      next();
      return;
    }

    // Check free tier limit
    if (req.user.invoiceCount >= req.user.maxInvoices) {
      res.status(403).json({
        message: 'Invoice limit reached. Upgrade to Pro for unlimited invoices.',
        currentCount: req.user.invoiceCount,
        maxInvoices: req.user.maxInvoices,
        plan: req.user.plan
      });
      return;
    }

    next();
  } catch (error: any) {
    console.error('Invoice limit check error:', error);
    res.status(500).json({ message: 'Failed to check invoice limit' });
  }
};