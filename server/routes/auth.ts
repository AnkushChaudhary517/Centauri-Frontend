import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken'; // Assume JWT library is installed

export const validateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer '
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!); // Validate token
    (req as any).user = decoded; // Attach user info to request
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Example protected route
export const getProfile: RequestHandler = (req, res) => {
  // Access (req as any).user for user data
  res.json({ message: 'Profile data', user: (req as any).user });
};