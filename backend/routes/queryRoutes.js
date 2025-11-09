import express from 'express';
import {
	query,
} from '../controllers/queryController.js';

const router = express.Router();

router
	.route('/')
	.post(query)

export default router;
