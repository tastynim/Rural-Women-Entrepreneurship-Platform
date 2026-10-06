const mongoose = require('mongoose');

const skillCertificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillName: { type: String, required: true },
    issuedBy: { type: String },
    issuedDate: { type: Date },
    certificationFile: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('SkillCertification', skillCertificationSchema);
