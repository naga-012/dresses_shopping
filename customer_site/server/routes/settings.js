const express = require('express');
const router = express.Router();
const { getStoreSettings, updateStoreSettings } = require('../controllers/settingsController');

// Public route to fetch store settings
router.get('/', getStoreSettings);

// Admin route to update store settings
router.post('/', updateStoreSettings);
router.put('/', updateStoreSettings);

module.exports = router;
