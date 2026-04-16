import express from 'express';
import { auth } from '../middleware/auth.js';
import Submission from '../models/Submission.js';

const router = express.Router();

// @route   POST /api/submissions
// @desc    Submit a new paper
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { paperTitle, abstract, authorsList, trackTheme } = req.body;
    
    const newSubmission = await Submission.create({
      authorId: req.user.id,
      paperTitle,
      abstract,
      authorsList,
      trackTheme,
    });
    
    res.status(201).json(newSubmission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/submissions/me
// @desc    Get user's submissions
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const submissions = await Submission.find({ authorId: req.user.id }).sort('-submittedAt');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
