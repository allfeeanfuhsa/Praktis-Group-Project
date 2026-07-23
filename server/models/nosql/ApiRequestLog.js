// server/models/nosql/ApiRequestLog.js
const mongoose = require('mongoose');

const ApiRequestLogSchema = new mongoose.Schema({
  ip_address: { type: String, required: true, index: true },
  method: { type: String, required: true }, // GET, POST, PUT, DELETE
  endpoint: { type: String, required: true },
  status_code: { type: Number, required: true, index: true },
  response_time_ms: { type: Number, default: 0 },
  content_length_bytes: { type: Number, default: 0 },
  user_id: { type: Number, index: true },
  user_name: { type: String },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: false
});

// TTL index: auto-delete logs older than 7 days (604800 seconds)
ApiRequestLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('ApiRequestLog', ApiRequestLogSchema);
