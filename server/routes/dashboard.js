const router = require('express').Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const todoTasks = await Task.countDocuments({ status: 'todo' });
    const inProgressTasks = await Task.countDocuments({ status: 'in_progress' });
    const inReviewTasks = await Task.countDocuments({ status: 'in_review' });
    const doneTasks = await Task.countDocuments({ status: 'done' });
    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' },
    });
    const totalProjects = await Project.countDocuments();
    const totalMembers = await User.countDocuments();

    // Tasks per user
    const users = await User.find().select('name');
    const tasksByUser = await Promise.all(
      users.map(async (u) => ({
        name: u.name.split(' ')[0],
        tasks: await Task.countDocuments({ assignee: u._id }),
      }))
    );

    res.json({
      totalTasks, todoTasks, inProgressTasks, inReviewTasks,
      doneTasks, overdueTasks, totalProjects, totalMembers,
      tasksByUser: tasksByUser.filter(u => u.tasks > 0),
    });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
