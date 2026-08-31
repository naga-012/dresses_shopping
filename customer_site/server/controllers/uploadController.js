const path = require('path');
const fs = require('fs');

// Simple local fallback upload handler if Cloudinary is not active
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Return relative URL or full path
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.filename, mimetype: req.file.mimetype });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
