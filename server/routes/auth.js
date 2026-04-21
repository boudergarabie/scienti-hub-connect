import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Admin email — this email is always forced to the 'Admin' role
const ADMIN_EMAIL = 'rabieboudrega63@gmail.com';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'your_super_secret_jwt_key', { expiresIn: '30d' });
};

// Helper: determine role based on email for initial setup
const resolveRole = (email) => {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'Admin' : 'User';
};

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const role = resolveRole(email);

    user = await User.create({
      name,
      email,
      passwordHash,
      role,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      userCategory: user.userCategory,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && user.authProvider === 'Local' && (await bcrypt.compare(password, user.passwordHash))) {
      // Only force Master Admin to 'Admin', do not demote other roles
      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && user.role !== 'Admin') {
        user.role = 'Admin';
        await user.save();
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userCategory: user.userCategory,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { tokenId } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email_verified, name, email } = ticket.getPayload();

    if (email_verified) {
      let user = await User.findOne({ email });
      const role = resolveRole(email);
      
      if (!user) {
        // Create new user for google oauth
        user = await User.create({
          name,
          email,
          authProvider: 'Google',
          role,
        });
      } else {
        // Only force Master Admin to 'Admin', do not demote other admins
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && user.role !== 'Admin') {
          user.role = 'Admin';
          await user.save();
        }
      }
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userCategory: user.userCategory,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: "Google account not verified" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  PUT /api/auth/category
router.put('/category', auth, async (req, res) => {
  try {
    const { category } = req.body;
    if (!['Author', 'Attendee'].includes(category)) {
      return res.status(400).json({ message: "Invalid user category" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { userCategory: category },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      userCategory: user.userCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
