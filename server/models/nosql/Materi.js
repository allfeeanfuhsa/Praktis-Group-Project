// server/models/nosql/Materi.js
const mongoose = require('mongoose');

const MateriSchema = new mongoose.Schema({
  pertemuan_id: { type: Number, required: true, index: true }, // Link to SQL Session
  judul: { type: String, required: true },
  deskripsi: { type: String },
  
  // Files (PDFs, PPTs)
  attachments: [{
    filename: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  
  created_by: { type: Number, required: true } // Asdos ID
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

module.exports = mongoose.model('Materi', MateriSchema);