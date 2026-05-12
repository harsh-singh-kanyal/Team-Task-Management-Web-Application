const router = require('express').Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');

// Get my tasks
router.get('/my', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id })
      .populate('assignee', 'name email')
      .populate('project', 'name color')
      .sort({ createdAt: -1 });
    const result = tasks.map(t => ({
      ...t.toObject(),
      projectName: t.project?.name || '',
    }));
    res.json(result);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const taskToUpdate = await Task.findById(req.params.id);
    if (!taskToUpdate) return res.status(404).json({ message: 'Task not found' });

    const isAssignee = taskToUpdate.assignee && taskToUpdate.assignee.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isAssignee) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignee', 'name email');
    res.json(task);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isProjectOwner = task.project && task.project.owner && task.project.owner.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isProjectOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
