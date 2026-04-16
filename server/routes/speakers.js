import express from 'express';
import Speaker from '../models/Speaker.js';

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

export default router;
