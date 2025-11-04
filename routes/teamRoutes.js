const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const auth = require('../middleware/auth');

router.post('/request/:targetUserId', auth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const requesterId = req.user._id;

    if (targetUserId === requesterId.toString()) {
      return res.status(400).json({ msg: 'You cannot send a request to yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const requester = await User.findById(requesterId);

    if (!targetUser || !requester) return res.status(404).json({ msg: 'User not found' });

    if (targetUser.adminRequests.includes(requesterId))
      return res.status(400).json({ msg: 'Request already sent' });

    if (targetUser.admins.includes(requesterId))
      return res.status(400).json({ msg: 'User already in your team' });

    targetUser.adminRequests.push(requesterId);
    await targetUser.save();

    res.json({ msg: 'Admin request sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/request-by-userid/:targetUserCode', auth, async (req, res) => {
  try {
    const { targetUserCode } = req.params;
    const requesterId = req.user._id;

    const requester = await User.findById(requesterId);
    const targetUser = await User.findOne({ userId: targetUserCode });

    if (!targetUser) {
      return res.status(404).json({ msg: 'User with that ID not found' });
    }

    if (targetUser._id.equals(requesterId)) {
      return res.status(400).json({ msg: 'You cannot send a request to yourself' });
    }

    if (targetUser.adminRequests.includes(requesterId))
      return res.status(400).json({ msg: 'Request already sent' });

    if (targetUser.admins.includes(requesterId))
      return res.status(400).json({ msg: 'User already in your team' });

    targetUser.adminRequests.push(requesterId);
    await targetUser.save();

    res.json({ msg: 'Admin request sent successfully using userId' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/accept/:adminId', auth, async (req, res) => {
  try {
    const { adminId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const admin = await User.findById(adminId);

    if (!user || !admin) return res.status(404).json({ msg: 'User not found' });

    if (!user.adminRequests.includes(adminId))
      return res.status(400).json({ msg: 'No such request found' });

    user.adminRequests = user.adminRequests.filter((id) => id.toString() !== adminId);

    if (!user.admins.includes(adminId)) user.admins.push(adminId);
    if (!admin.teamMembers.includes(userId)) admin.teamMembers.push(userId);

    await user.save();
    await admin.save();

    res.json({ msg: 'Admin request accepted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/reject/:adminId', auth, async (req, res) => {
  try {
    const { adminId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.adminRequests = user.adminRequests.filter((id) => id.toString() !== adminId);
    await user.save();

    res.json({ msg: 'Admin request rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/list', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('teamMembers', 'name email userId')
      .populate('admins', 'name email')
      .populate('adminRequests', 'name email');
      
console.log("Fetched user:", user);
console.log("Team members from DB:", user.teamMembers);

    res.json({
      teamMembers: user.teamMembers,
      admins: user.admins,
      adminRequests: user.adminRequests,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
