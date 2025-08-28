const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    industry: { type: String, required: true },
    location: { type: String, required: true },
    employeeCount: { type: Number, required: true },
    founded: { type: Number, required: true },
    revenue: { type: Number }, // in millions
    website: { type: String },
    description: { type: String }
}, { timestamps: true });

// Create indexes for better search performance
companySchema.index({ name: 'text', industry: 'text', location: 'text' });

module.exports = mongoose.model('Company', companySchema);