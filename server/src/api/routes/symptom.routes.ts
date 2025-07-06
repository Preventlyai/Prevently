import express from 'express';
import {
  createSymptomLog,
  getSymptomLogsForUser,
  getSymptomLogById,
  updateSymptomLog,
  deleteSymptomLog,
  getSymptomAnalytics,
  getAIInsights
} from '../controllers/symptomController';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

// All symptom routes require authentication
router.use(protect);

// Basic CRUD operations
router.route('/')
  .get(getSymptomLogsForUser)
  .post(createSymptomLog);

router.route('/:id')
  .get(getSymptomLogById)
  .put(updateSymptomLog)
  .delete(deleteSymptomLog);

// Analytics and insights
router.get('/analytics', getSymptomAnalytics);
router.get('/insights', authorize('premium'), getAIInsights); // Premium feature

export default router;