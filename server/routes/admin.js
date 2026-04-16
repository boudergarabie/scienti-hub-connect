import express from 'express';
import { auth, adminAuth } from '../middleware/auth.js';
import Submission from '../models/Submission.js';

const router = express.Router();

// @route   GET /api/admin/submissions
// @desc    Get all submissions
// @access  Private/Admin
router.get('/submissions', auth, adminAuth, async (req, res) => {
  try {
    const submissions = await Submission.find({}).populate('authorId', 'name email');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/submissions/:id/status
// @desc    Update submission status
// @access  Private/Admin
router.put('/submissions/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
