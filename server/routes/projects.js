const router = require('express').Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { auth } = require('../middleware/auth');

// Get all projects for user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    }).populate('members', 'name email role').populate('owner', 'name email');

    // Add task counts
    const result = await Promise.all(projects.map(async (p) => {
      const totalTasks = await Task.countDocuments({ project: p._id });
      const doneTasks = await Task.countDocuments({ project: p._id, status: 'done' });
      return { ...p.toObject(), taskCount: totalTasks, doneCount: doneTasks };
    }));

    res.json(result);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email role')
      .populate('owner', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      owner: req.user._id,
      members: [req.user._id],
    });
    res.status(201).json(project);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const projectToUpdate = await Project.findById(req.params.id);
    if (!projectToUpdate) return res.status(404).json({ message: 'Project not found' });
    
    if (projectToUpdate.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update project' });
    }

    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(project);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Add member to project
router.post('/:id/members', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!project.members.includes(req.body.userId)) {
      project.members.push(req.body.userId);
      await project.save();
    }
    await project.populate('members', 'name email role');
    res.json(project);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Remove member from project
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    project.members = project.members.filter(m => m.toString() !== req.params.userId);
    await project.save();
    res.json(project);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Get tasks for project
router.get('/:id/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.id })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Create task in project
router.post('/:id/tasks', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create tasks' });
    }

    const task = await Task.create({
      ...req.body,
      project: req.params.id,
      createdBy: req.user._id,
    });
    await task.populate('assignee', 'name email');
    res.status(201).json(task);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
