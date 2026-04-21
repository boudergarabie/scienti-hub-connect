import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Lazy DB connection — cached across serverless warm invocations
let dbPromise = null;
function connectDB() {
  if (!dbPromise) {
    dbPromise = mongoose.connect(process.env.MONGO_URI);
  }
  return dbPromise;
}

app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Main entry route
app.get('/', (_req, res) => {
  res.send('Scienti-Hub Connect API runs fine.');
});

// Setup Routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/speakers', speakerRoutes);

// Start HTTP server only in local dev (Vercel sets NODE_ENV=production)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
