// server/models/nosql/BannedIP.js
const mongoose = require('mongoose');

const BannedIPSchema = new mongoose.Schema({
  ip_address: { type: String, required: true, unique: true, index: true },
  reason: { type: String, default: 'Dilarang oleh Administrator' },
  banned_by: { type: Number }, // Admin User ID
  banned_by_name: { type: String, default: 'Administrator' },
  banned_at: { type: Date, default: Date.now },
  expires_at: { type: Date, default: null }, // null means permanent ban
  is_permanent: { type: Boolean, default: false }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('BannedIP', BannedIPSchema);
