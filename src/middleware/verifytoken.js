import jwt from 'jsonwebtoken';
import UserEmail from '../models/userDetailsModel.js';

const verifyToken = async (req, res, next) => {

  try {

    // Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: 'Missing Token'
      });
    }

    // Expected format:
    // Authorization: Bearer <token>
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        message: 'Invalid Authorization format'
      });
    }
    // Verify JWT
    const token = parts[1];
    const decoded = jwt.verify(
      token,
      process.env.SECRET_KEY
    );

    // Find user
    const user = await UserEmail.findOne({
      _id: decoded.id
    });

    if (!user) {
      return res.status(404).json({
        message: 'User Not Found'
      });
    }
    // Store user in request
    req.user = user;
    console.log(
      'User verified successfully:',
      user
    );
    // Continue to controller
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(403).json({
      message: 'Invalid or expired token'
    });
  }
};

export default verifyToken;