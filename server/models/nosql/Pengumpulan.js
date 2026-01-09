const mongoose = require('mongoose');

const PengumpulanSchema = new mongoose.Schema({
  tugas_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tugas',
    required: true,
    index: true
  },
  
  student_id: { 
    type: Number, 
    required: true,
    index: true
  },
  
  file: {
    filename: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: String,
    size: Number
  },
  
  status: { 
    type: String, 
    enum: ['diserahkan', 'dinilai', 'terlambat'],
    default: 'diserahkan'
  },
  
  nilai: { 
    type: Number,
    min: 0,
    max: 100
  },
  
  feedback: String,
  
  submitted_at: { type: Date, default: Date.now },
  graded_by: Number,
  graded_at: Date
  
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

// Compound index to prevent duplicate submissions
PengumpulanSchema.index({ tugas_id: 1, student_id: 1 }, { unique: true });

module.exports = mongoose.model('Pengumpulan', PengumpulanSchema);