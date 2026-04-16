import mongoose from 'mongoose';

const speakerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  affiliation: { type: String },
  topic: { type: String },
  country: { type: String },
  theme: { type: String },
  photoURL: { type: String },
  biography: { type: String },
}, { timestamps: true });

export default mongoose.model('Speaker', speakerSchema);
