import express from 'express';
import { query, getQueryHistory, deleteQuery } from '../controllers/queryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, query);
router.route('/history').get(protect, getQueryHistory);
router.route('/:id').delete(protect, deleteQuery);

export default router;
