import express from 'express';
import Speaker from '../models/Speaker.js';
import Submission from '../models/Submission.js';

const router = express.Router();

// @route   GET /api/speakers
// @desc    Get all speakers, optionally filter by country and/or theme
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { country, theme, q } = req.query;
    let query = {};

    if (country) query.country = country;
    if (theme) query.theme = theme;

    let speakers = await Speaker.find(query).sort('fullName');

    // Text search across name, affiliation, country, theme
    if (q) {
      const search = q.toLowerCase();
      speakers = speakers.filter(s =>
        s.fullName?.toLowerCase().includes(search) ||
        s.affiliation?.toLowerCase().includes(search) ||
        s.country?.toLowerCase().includes(search) ||
        s.theme?.toLowerCase().includes(search)
      );
    }

    res.json(speakers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/speakers/filters
// @desc    Get distinct countries and themes for filter dropdowns
// @access  Public
router.get('/filters', async (req, res) => {
  try {
    const countries = await Speaker.distinct('country');
    const themes = await Speaker.distinct('theme');
    res.json({
      countries: countries.filter(Boolean).sort(),
      themes: themes.filter(Boolean).sort(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/speakers/:id/paper
// @desc    Get the submission linked to a speaker profile
// @access  Public
router.get('/:id/paper', async (req, res) => {
  try {
    const speaker = await Speaker.findById(req.params.id);
    if (!speaker) return res.status(404).json({ message: 'Speaker not found' });
    if (!speaker.submissionId) return res.json(null);

    const submission = await Submission.findById(speaker.submissionId)
      .select('paperTitle abstract trackTheme authorsList status paperFileURL submittedAt');
    res.json(submission || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
