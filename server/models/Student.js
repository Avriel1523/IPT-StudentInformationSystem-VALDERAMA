import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  middleName: {
    type: String,
    trim: true,
    default: ''
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    enum: ['BSIT', 'BSCS', 'BSLM']
  },
  year: {
    type: String,
    required: true,
    enum: ['1', '2', '3', '4']
  },
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Create indexes for better performance
studentSchema.index({ id: 1 });
studentSchema.index({ firstName: 1, lastName: 1 });

export default mongoose.model('Student', studentSchema);
