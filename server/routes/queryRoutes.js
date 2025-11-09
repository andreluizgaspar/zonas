import express from 'express';
import { query, getQueryHistory } from '../controllers/queryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, query);
router.route('/history').get(protect, getQueryHistory);

export default router;
