const express = require('express');
const { body } = require('express-validator');
const workflowController = require('../controllers/workflowController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/dashboard', workflowController.dashboard);
router.get('/', workflowController.list);
router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Workflow name is required')],
  workflowController.create
);
router.post(
  '/generate',
  [body('prompt').trim().notEmpty().withMessage('Prompt is required')],
  workflowController.generate
);
router.get('/:id', workflowController.getById);
router.put('/:id', workflowController.update);
router.post('/:id/duplicate', workflowController.duplicate);
router.post('/:id/execute', workflowController.execute);
router.delete('/:id', workflowController.remove);

module.exports = router;
