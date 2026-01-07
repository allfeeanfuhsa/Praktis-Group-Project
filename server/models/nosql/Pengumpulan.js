// server/models/nosql/Pengumpulan.js
const mongoose = require('mongoose');

const PengumpulanSchema = new mongoose.Schema({
  tugas_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tugas', 
    required: true,
    index: true
  },
  student_id: { 
    type: Number, // SQL User ID
    required: true,
    index: true 
  },
  // We store file metadata here
  file: {
    filename: String,
    path: String,
    mimetype: String,
    size: Number
  },
  // Grading fields (Initially null)
  nilai: { type: Number, default: null },
  feedback: { type: String, default: null },
  status: { 
    type: String, 
    enum: ['diserahkan', 'dinilai', 'terlambat'],
    default: 'diserahkan' 
  }
}, { 
  timestamps: { createdAt: 'waktu_pengumpulan', updatedAt: 'updated_at' } 
});

module.exports = mongoose.model('Pengumpulan', PengumpulanSchema);