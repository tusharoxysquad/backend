const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);

router.get('/', notificationController.getNotifications);
router.patch('/:id', notificationController.markAsRead);

module.exports = router;
