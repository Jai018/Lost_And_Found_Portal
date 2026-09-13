import { Router, Request, Response } from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { aiService } from '../services/ai.service';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ── AI Description Generation ──────────────────────────────────────────────
router.post('/generate-description', protect, upload.array('images', 5), asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.body;
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one image is required for AI generation.' });
  }

  // We only use the first image for generating the description
  const primaryImage = files[0];
  const result = await aiService.generateDescription(primaryImage.buffer, primaryImage.mimetype, category);
  
  res.json({ success: true, data: result });
}));

// ── AI Chatbot ─────────────────────────────────────────────────────────────
router.post('/chat', asyncHandler(async (req: Request, res: Response) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ success: false, message: 'Messages array is required.' });
  }

  const responseText = await aiService.handleChat(messages);
  res.json({ success: true, data: { response: responseText } });
}));

export default router;
