import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  paperTitle: { type: String, required: true },
  abstract: { type: String, required: true },
  authorsList: { type: String },
  trackTheme: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Accepted', 'Rejected', 'Published'],
    default: 'Pending',
  },
  paperFileURL: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Submission', submissionSchema);
