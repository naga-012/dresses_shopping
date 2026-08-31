const express = require('express');
const router = express.Router();
const { getCollections, getCollectionById, createCollection, updateCollection, deleteCollection } = require('../controllers/collectionController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(getCollections)
  .post(protect, admin, createCollection);

router.route('/:id')
  .get(getCollectionById)
  .put(protect, admin, updateCollection)
  .delete(protect, admin, deleteCollection);

module.exports = router;
