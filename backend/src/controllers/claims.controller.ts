// Claims are no longer used in the org-scoped workflow.
// This file is kept as a stub to avoid import errors.
// Users now submit OrgReports privately to admin instead of filing claims.
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';

export const submitClaim = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.status(410).json({ success: false, message: 'Claims are no longer available. Please use the "Report Lost Item" feature to submit a private report to the admin.' });
});

export const getClaims = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.json({ success: true, data: [] });
});

export const updateClaim = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.status(410).json({ success: false, message: 'Claims are no longer available.' });
});
