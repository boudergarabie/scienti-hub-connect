import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String }, // Optional if using Google OAuth
  role: { type: String, enum: ['Admin', 'Author'], default: 'Author' },
  authProvider: { type: String, enum: ['Local', 'Google'], default: 'Local' },
  userCategory: { type: String, enum: ['Author', 'Attendee'] },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
