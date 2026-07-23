// server/models/nosql/UserSession.js
const mongoose = require('mongoose');

const UserSessionSchema = new mongoose.Schema({
  ip_address: { type: String, required: true, index: true },
  user_id: { type: Number, index: true },
  user_name: { type: String },
  user_email: { type: String },
  user_roles: [{ type: String }],
  user_agent: { type: String },
  last_active: { type: Date, default: Date.now, index: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('UserSession', UserSessionSchema);
