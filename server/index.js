import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.js';
import submissionRoutes from './routes/submissions.js';
import agendaRoutes from './routes/agenda.js';
import adminRoutes from './routes/admin.js';
import speakerRoutes from './routes/speakers.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Main entry route
app.get('/', (req, res) => {
  res.send('Scienti-Hub Connect API runs fine.');
});

// Setup Routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/speakers', speakerRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
