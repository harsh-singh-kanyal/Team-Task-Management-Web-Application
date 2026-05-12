const router = require('express').Router();
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

// Get all users
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Invite user (admin creates a member account)
router.post('/invite', auth, adminOnly, async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({
      name: name || email.split('@')[0],
      email,
      password: 'password123', // default password for invited users
      role: 'member',
    });
    res.status(201).json(user);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Update user role
router.put('/:id/role', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Delete user
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'Cannot remove yourself' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
