"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const document_controller_1 = require("../controllers/document.controller");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Only authenticated users can upload documents
router.post('/upload', auth_1.authenticate, upload_1.upload.single('file'), document_controller_1.uploadDocument);
// Reviewer/Admin endpoints
router.get('/pending', auth_1.authenticate, (0, auth_1.authorizeRoles)('REVIEWER', 'ADMIN'), document_controller_1.getPendingDocuments);
router.put('/:id/review', auth_1.authenticate, (0, auth_1.authorizeRoles)('REVIEWER', 'ADMIN'), document_controller_1.reviewDocument);
router.get('/:id/download', auth_1.authenticate, document_controller_1.downloadStampedDocument);
exports.default = router;
