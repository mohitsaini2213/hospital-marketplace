const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/facilityController');
router.get('/facilities', ctrl.mapFacilities);
module.exports = router;
