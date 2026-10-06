const SkillCertification = require('../models/SkillCertification');

const listCertifications = async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { user: req.user.id };
        const certs = await SkillCertification.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(certs);
    } catch (err) {
        console.error('listCertifications error', err);
        res.status(500).json({ message: 'Failed to fetch certifications' });
    }
};

const uploadCertification = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Certification file is required' });
        const { skillName, issuedBy, issuedDate } = req.body;
        if (!skillName) return res.status(400).json({ message: 'skillName is required' });

        const cert = new SkillCertification({
            user: req.user.id,
            skillName,
            issuedBy: issuedBy || undefined,
            issuedDate: issuedDate || undefined,
            certificationFile: req.file.filename,
            status: req.user.role === 'admin' ? 'Approved' : 'Pending',
        });
        await cert.save();
        res.status(201).json({ message: 'Certification uploaded successfully', certification: cert });
    } catch (err) {
        console.error('uploadCertification error', err);
        res.status(500).json({ message: 'Failed to upload certification' });
    }
};

const updateCertificationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be Pending, Approved, or Rejected' });
        }
        const cert = await SkillCertification.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!cert) return res.status(404).json({ message: 'Certification not found' });
        res.json({ message: `Certification ${status}`, certification: cert });
    } catch (err) {
        console.error('updateCertificationStatus error', err);
        res.status(500).json({ message: 'Failed to update certification status' });
    }
};

const deleteCertification = async (req, res) => {
    try {
        const cert = await SkillCertification.findOne({ _id: req.params.id, user: req.user.id });
        if (!cert) return res.status(404).json({ message: 'Certification not found or not authorized' });
        await SkillCertification.findByIdAndDelete(req.params.id);
        res.json({ message: 'Certification deleted' });
    } catch (err) {
        console.error('deleteCertification error', err);
        res.status(500).json({ message: 'Failed to delete certification' });
    }
};

module.exports = { listCertifications, uploadCertification, updateCertificationStatus, deleteCertification };
