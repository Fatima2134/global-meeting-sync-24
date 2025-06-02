// backend/models/Appointment.js
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  timezone: { type: String, required: true },
  dateTime: { type: Date, required: true },
  userEmail: { type: String, required: true },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
