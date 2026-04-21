import mongoose from 'mongoose';

const speakerRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
  fullName: { type: String, required: true },
  academicTitle: { type: String, default: '' },
  affiliation: { type: String, default: '' },
  theme: { type: String, default: '' },
  biography: { type: String, default: '' },
  photoURL: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  adminNote: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('SpeakerRequest', speakerRequestSchema);
