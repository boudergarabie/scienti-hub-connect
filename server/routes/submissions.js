import express from 'express';
import { auth } from '../middleware/auth.js';
import Submission from '../models/Submission.js';
import SpeakerRequest from '../models/SpeakerRequest.js';

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

// @route   GET /api/submissions/me/accepted
// @desc    Get user's accepted/published submissions (for certificate generation)
// @access  Private
router.get('/me/accepted', auth, async (req, res) => {
  try {
    const accepted = await Submission.find({
      authorId: req.user.id,
      status: { $in: ['Accepted', 'Published'] },
    }).sort('-submittedAt');
    res.json(accepted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/submissions/me/published
// @desc    Get user's published submissions (for speaker onboarding eligibility)
// @access  Private
router.get('/me/published', auth, async (req, res) => {
  try {
    const published = await Submission.find({
      authorId: req.user.id,
      status: 'Published',
    }).sort('-submittedAt');
    res.json(published);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/submissions/speaker-onboarding/status
// @desc    Get the current user's speaker request status
// @access  Private
router.get('/speaker-onboarding/status', auth, async (req, res) => {
  try {
    const request = await SpeakerRequest.findOne({ userId: req.user.id })
      .sort('-createdAt')
      .populate('submissionId', 'paperTitle');
    res.json(request); // null if none exists
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/submissions/speaker-onboarding
// @desc    Author submits their speaker profile after paper is published
// @access  Private
router.post('/speaker-onboarding', auth, async (req, res) => {
  try {
    // Check that author has at least one published paper
    const publishedPaper = await Submission.findOne({
      authorId: req.user.id,
      status: 'Published',
    });
    if (!publishedPaper) {
      return res.status(403).json({ message: 'You must have at least one published paper to submit a speaker profile.' });
    }

    // Check if a pending/approved request already exists
    const existing = await SpeakerRequest.findOne({
      userId: req.user.id,
      status: { $in: ['Pending', 'Approved'] },
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have an active speaker profile request.' });
    }

    const { fullName, academicTitle, affiliation, theme, biography, photoURL } = req.body;
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ message: 'Full name is required.' });
    }

    const speakerRequest = await SpeakerRequest.create({
      userId: req.user.id,
      submissionId: publishedPaper._id,
      fullName: fullName.trim(),
      academicTitle: academicTitle?.trim() || '',
      affiliation: affiliation?.trim() || '',
      theme: theme || '',
      biography: biography?.trim() || '',
      photoURL: photoURL || '',
    });

    res.status(201).json(speakerRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
