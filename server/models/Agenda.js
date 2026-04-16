import mongoose from 'mongoose';

const agendaSchema = new mongoose.Schema({
  timeSlot: { type: String, required: true },
  sessionTitle: { type: String, required: true },
  speakerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Speaker' },
  roomLocation: { type: String },
  theme: { type: String },
  day: { type: Number, default: 1 }
}, { timestamps: true });

export default mongoose.model('Agenda', agendaSchema);
