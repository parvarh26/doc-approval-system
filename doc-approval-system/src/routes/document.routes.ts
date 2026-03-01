import { Router } from 'express';
import { uploadDocument, getPendingDocuments, reviewDocument, downloadStampedDocument, getMyDocuments } from '../controllers/document.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Only authenticated users can upload documents
router.post('/upload', authenticate, upload.single('file'), uploadDocument);
router.get('/my', authenticate, getMyDocuments);

// Reviewer/Admin endpoints
router.get('/pending', authenticate, authorizeRoles('REVIEWER', 'ADMIN'), getPendingDocuments);
router.put('/:id/review', authenticate, authorizeRoles('REVIEWER', 'ADMIN'), reviewDocument);

router.get('/:id/download', authenticate, downloadStampedDocument);

export default router;
