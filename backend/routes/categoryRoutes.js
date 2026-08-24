const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/facilityController');
router.get('/', ctrl.listCategories);
module.exports = router;
