import { Router, Response } from 'express';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { Conversation, Message } from '../models/index';
import { asyncHandler } from '../middleware/error';

const router = Router();

// Get all conversations for current user
router.get('/', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const convs = await Conversation.find({ participants: req.user!._id, isActive: true })
    .populate('participants', 'name avatar isVerified trustScore')
    .populate('item', 'title images type status')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

  const data = convs.map((c) => ({
    ...c.toJSON(),
    unreadCount: c.unreadCounts?.get(req.user!._id.toString()) || 0,
  }));

  res.json({ success: true, data });
}));

// Get messages for a conversation
router.get('/:id/messages', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const conv = await Conversation.findOne({ _id: req.params.id, participants: req.user!._id });
  if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found.' });

  const msgs = await Message.find({ conversationId: req.params.id })
    .populate('sender', 'name avatar')
    .sort({ createdAt: 1 })
    .limit(100);

  // Mark as read
  conv.unreadCounts?.set(req.user!._id.toString(), 0);
  await conv.save();

  res.json({ success: true, data: msgs });
}));

// Send message
router.post('/:id/messages', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const conv = await Conversation.findOne({ _id: req.params.id, participants: req.user!._id });
  if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found.' });

  const msg = await Message.create({
    conversationId: conv._id,
    sender:  req.user!._id,
    content: req.body.content,
    type:    req.body.type || 'text',
  });

  conv.lastMessage = msg._id as any;
  // Increment unread for other participants
  conv.participants.forEach((p) => {
    if (p.toString() !== req.user!._id.toString()) {
      const cur = conv.unreadCounts?.get(p.toString()) || 0;
      conv.unreadCounts?.set(p.toString(), cur + 1);
    }
  });
  await conv.save();

  await msg.populate('sender', 'name avatar');
  res.status(201).json({ success: true, data: msg });
}));

// Start / find conversation for an item
router.post('/start', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { itemId, receiverId } = req.body;

  let conv = await Conversation.findOne({
    item: itemId,
    participants: { $all: [req.user!._id, receiverId] },
  });

  if (!conv) {
    conv = await Conversation.create({
      item: itemId,
      participants: [req.user!._id, receiverId],
    });
  }

  await conv.populate('participants', 'name avatar isVerified trustScore');
  await conv.populate('item', 'title images type status');
  res.json({ success: true, data: conv });
}));

export default router;
