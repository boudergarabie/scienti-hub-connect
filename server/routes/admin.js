import express from 'express';
import { auth, adminAuth } from '../middleware/auth.js';
import Submission from '../models/Submission.js';
import Speaker from '../models/Speaker.js';
import Agenda from '../models/Agenda.js';
import User from '../models/User.js';
import SpeakerRequest from '../models/SpeakerRequest.js';

const router = express.Router();

// ─── ANALYTICS / STATS ────────────────────────────────────────

// @route   GET /api/admin/stats
// @desc    Get conference analytics overview
// @access  Private/Admin
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const [totalUsers, totalPapers, totalSpeakers, submissions, pendingSpeakerRequests] = await Promise.all([
      User.countDocuments(),
      Submission.countDocuments(),
      Speaker.countDocuments(),
      Submission.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      SpeakerRequest.countDocuments({ status: 'Pending' }),
    ]);

    const statusCounts = {};
    submissions.forEach(s => { statusCounts[s._id] = s.count; });

    const totalAuthors = await User.countDocuments({ userCategory: 'Author' });
    const totalAttendees = await User.countDocuments({ userCategory: 'Attendee' });

    res.json({
      totalUsers,
      totalPapers,
      totalSpeakers,
      totalAuthors,
      totalAttendees,
      statusCounts,
      pendingSpeakerRequests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── USER DIRECTORY ───────────────────────────────────────────

// @route   GET /api/admin/users
// @desc    Get all registered users with submission info
// @access  Private/Admin
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).select('-passwordHash').sort('-createdAt').lean();

    const submissionAgg = await Submission.aggregate([
      { $group: { _id: '$authorId', total: { $sum: 1 }, accepted: { $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] } }, pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } } } }
    ]);

    const subMap = {};
    submissionAgg.forEach(s => { subMap[s._id.toString()] = s; });

    const speakers = await Speaker.find({}).select('fullName').lean();
    const speakerNames = new Set(speakers.map(s => s.fullName?.toLowerCase()));

    const enriched = users.map(u => ({
      ...u,
      submissions: subMap[u._id.toString()] || { total: 0, accepted: 0, pending: 0 },
      isSpeaker: speakerNames.has(u.name?.toLowerCase()),
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update a user's role or userCategory
// @access  Private/Admin
router.put('/users/:id/role', auth, adminAuth, async (req, res) => {
  try {
    const { role, userCategory } = req.body;
    const update = {};
    if (role) update.role = role;
    if (userCategory) update.userCategory = userCategory;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── SUBMISSIONS ───────────────────────────────────────────────

router.get('/submissions', auth, adminAuth, async (req, res) => {
  try {
    const submissions = await Submission.find({}).populate('authorId', 'name email');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/submissions/:id/status
// @desc    Update a submission's status. When set to 'Published', ensure author is marked as Author.
// @access  Private/Admin
router.put('/submissions/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const submission = await Submission.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    // When a paper is Published, ensure the author's userCategory is 'Author'
    if (status === 'Published') {
      await User.findByIdAndUpdate(submission.authorId, { userCategory: 'Author' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── SPEAKER REQUESTS (Approval Queue) ────────────────────────

// @route   GET /api/admin/speaker-requests
// @desc    Get all speaker onboarding requests
// @access  Private/Admin
router.get('/speaker-requests', auth, adminAuth, async (req, res) => {
  try {
    const requests = await SpeakerRequest.find({})
      .populate('userId', 'name email')
      .populate('submissionId', 'paperTitle trackTheme')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/speaker-requests/:id/approve
// @desc    Approve a speaker request — create a Speaker document
// @access  Private/Admin
router.put('/speaker-requests/:id/approve', auth, adminAuth, async (req, res) => {
  try {
    const speakerReq = await SpeakerRequest.findById(req.params.id);
    if (!speakerReq) return res.status(404).json({ message: 'Speaker request not found' });
    if (speakerReq.status === 'Approved') return res.status(400).json({ message: 'Already approved' });

    // Create the Speaker document
    await Speaker.create({
      fullName: speakerReq.fullName,
      academicTitle: speakerReq.academicTitle,
      affiliation: speakerReq.affiliation,
      theme: speakerReq.theme,
      biography: speakerReq.biography,
      photoURL: speakerReq.photoURL,
      submissionId: speakerReq.submissionId,
    });

    // Mark request as approved
    speakerReq.status = 'Approved';
    await speakerReq.save();

    res.json({ message: 'Speaker approved and added to the speakers list.', speakerRequest: speakerReq });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/speaker-requests/:id/reject
// @desc    Reject a speaker request with an optional note
// @access  Private/Admin
router.put('/speaker-requests/:id/reject', auth, adminAuth, async (req, res) => {
  try {
    const speakerReq = await SpeakerRequest.findById(req.params.id);
    if (!speakerReq) return res.status(404).json({ message: 'Speaker request not found' });

    speakerReq.status = 'Rejected';
    speakerReq.adminNote = req.body.adminNote || '';
    await speakerReq.save();

    res.json({ message: 'Speaker request rejected.', speakerRequest: speakerReq });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── AGENDA ────────────────────────────────────────────────────

router.post('/agenda', auth, adminAuth, async (req, res) => {
  try {
    const { timeSlot, sessionTitle, speakerId, roomLocation, theme, day } = req.body;
    if (!timeSlot || !timeSlot.trim()) return res.status(400).json({ message: 'Time slot is required' });
    if (!sessionTitle || !sessionTitle.trim()) return res.status(400).json({ message: 'Session title is required' });

    const agenda = await Agenda.create({
      timeSlot: timeSlot.trim(), sessionTitle: sessionTitle.trim(), speakerId: speakerId || undefined, roomLocation: roomLocation?.trim() || '', theme: theme || '', day: day || 1,
    });
    const populated = await agenda.populate('speakerId');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
