const express = require('express');
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', notificationController.list);
router.post('/:id/read', notificationController.markRead);
router.post('/read-all', notificationController.markAllRead);

module.exports = router;
