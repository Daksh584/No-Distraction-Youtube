const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
  isHost: { type: Boolean, default: false },
}, { _id: false });

const roomSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    minlength: 6,
    maxlength: 6,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  videoId: {
    type: String,
    default: null,
  },
  videoTitle: {
    type: String,
    default: '',
  },
  participants: [participantSchema],
  videoState: {
    isPlaying: { type: Boolean, default: false },
    currentTime: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  maxParticipants: {
    type: Number,
    default: 10,
  },
}, {
  timestamps: true,
});

// Auto-delete rooms after 24 hours of inactivity
roomSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

// Generate a unique 6-character room code
roomSchema.statics.generateCode = async function () {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I/O/0/1 to avoid confusion
  let code;
  let exists = true;

  while (exists) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    exists = await this.findOne({ roomCode: code });
  }

  return code;
};

module.exports = mongoose.model('Room', roomSchema);
