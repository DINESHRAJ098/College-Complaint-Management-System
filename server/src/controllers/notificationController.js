const Notification = require('../models/Notification');

exports.list = async (req, res) => {
  try {
    const notifications = await Notification.find({ owner: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('workflowId', 'name')
      .populate('executionId', 'status');
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ owner: req.userId, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
