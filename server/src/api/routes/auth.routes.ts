import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateDetails,
  updatePassword,
  deleteAccount,
  addFamilyMember
} from '../controllers/authController';
import { protect, authRateLimit } from '../middlewares/auth.middleware';

const router = express.Router();

// Apply rate limiting to auth routes
const authLimit = authRateLimit(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

// Public routes
router.post('/register', authLimit, registerUser);
router.post('/login', authLimit, loginUser);

// Protected routes
router.get('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.delete('/deleteaccount', protect, deleteAccount);

// Family management
router.post('/family/add', protect, addFamilyMember);

export default router;