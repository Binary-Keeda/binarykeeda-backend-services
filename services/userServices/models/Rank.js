import mongoose from 'mongoose';

const RankSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  points: {
    type: Number,
    required: true,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

RankSchema.index({ points: -1 });

const Rank = mongoose.model('Rank', RankSchema);
export default Rank;
