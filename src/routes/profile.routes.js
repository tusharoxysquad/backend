const express = require('express');
const router = express.Router();
const { getProfile } = require('../controllers/profile.controller');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);

router.get('/', getProfile);

module.exports = router;
