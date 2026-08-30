const express = require('express');
const integrationController = require('../controllers/integrationController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/oauth/:provider/callback', integrationController.oauthCallback);
router.get('/oauth/error', integrationController.oauthError);

router.use(auth);

router.get('/', integrationController.list);
router.get('/status', integrationController.status);
router.get('/oauth/:provider/start', integrationController.oauthStart);
router.post('/', integrationController.create);

module.exports = router;
