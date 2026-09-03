const express = require('express');
const router = express.Router();
const { getStoreSettings, updateStoreSettings, getEmailStatus, sendTestEmail } = require('../controllers/settingsController');

// Public route to fetch store settings
router.get('/', getStoreSettings);

// Email testing & diagnostics routes
router.get('/email-status', getEmailStatus);
router.post('/test-email', sendTestEmail);

// Admin route to update store settings
router.post('/', updateStoreSettings);
router.put('/', updateStoreSettings);

module.exports = router;

