import admin from 'firebase-admin';
import serviceAccount from '../config/serviceAccountKey.js';
import { ADMIN_JWT_SECRET, USER_JWT_SECRET } from '../config/config.js';
import jwt from 'jsonwebtoken';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const verifyJWT = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
};

const authMiddleware = async (req, res, next) => {
  try {
    const { usertoken, admintoken } = req.cookies;
    if (usertoken || admintoken) {
      if (usertoken) {
        try {
          const user = await verifyJWT(usertoken, USER_JWT_SECRET);
          req.user = user;
        } catch (error) {
          return res.status(401).json({ message: 'Invalid user token', status: false });
        }
      }
      if (admintoken) {
        try {
          const adminUser = await verifyJWT(admintoken, ADMIN_JWT_SECRET);
          req.user = adminUser;
        } catch (error) {
          return res.status(401).json({ message: 'Invalid admin token', status: false });
        }
      }
      return next();
    }
    const token = req.header('Authorization')?.split('Bearer ')[1];
    if (token) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; 
        return next();
      } catch (error) {
        return res.status(401).json({ message: 'Invalid Firebase token', status: false });
      }
    }
    return res.status(401).json({ message: 'Token not provided', status: false });

  } catch (error) {
    return res.status(401).json({ message: 'Authentication error', status: false });
  }
};


export const tokenVerify = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.split('Bearer ')[1];
    if (token) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      return next();
    }
    return res.status(401).json({ message: 'Token not provided', status: false });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid Firebase token', status: false });
  }
}
export default authMiddleware;
