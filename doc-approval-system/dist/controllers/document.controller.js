"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadStampedDocument = exports.reviewDocument = exports.getPendingDocuments = exports.uploadDocument = void 0;
const prisma_1 = require("../prisma");
const pdf_service_1 = require("../services/pdf.service");
const uploadDocument = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const title = req.body.title || req.file.originalname;
        const document = await prisma_1.prisma.document.create({
            data: {
                title,
                filename: req.file.filename,
                originalPath: req.file.path,
                uploadedById: req.user.id,
                status: 'PENDING',
            },
        });
        // Create audit log
        await prisma_1.prisma.auditLog.create({
            data: {
                action: 'UPLOAD',
                documentId: document.id,
                userId: req.user.id,
            },
        });
        res.status(201).json(document);
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Error uploading document' });
    }
};
exports.uploadDocument = uploadDocument;
const getPendingDocuments = async (req, res) => {
    try {
        const documents = await prisma_1.prisma.document.findMany({
            where: { status: 'PENDING' },
            include: {
                uploadedBy: {
                    select: { email: true, id: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(documents);
    }
    catch (error) {
        console.error('Fetch pending error:', error);
        res.status(500).json({ error: 'Error fetching pending documents' });
    }
};
exports.getPendingDocuments = getPendingDocuments;
const reviewDocument = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        if (status !== 'APPROVED' && status !== 'REJECTED') {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }
        const document = await prisma_1.prisma.document.findUnique({ where: { id } });
        if (!document) {
            res.status(404).json({ error: 'Document not found' });
            return;
        }
        let stampedPath = null;
        if (status === 'APPROVED') {
            try {
                stampedPath = await (0, pdf_service_1.stampApprovedPDF)(document.originalPath, document.filename);
            }
            catch (err) {
                console.error('Stamping failed:', err);
                res.status(500).json({ error: 'Error stamping the document' });
                return;
            }
        }
        const updatedDocument = await prisma_1.prisma.document.update({
            where: { id },
            data: {
                status,
                ...(stampedPath && { stampedPath })
            },
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                action: status === 'APPROVED' ? 'APPROVE' : 'REJECT',
                documentId: id,
                userId: req.user.id,
            },
        });
        res.status(200).json(updatedDocument);
    }
    catch (error) {
        console.error('Review document error:', error);
        res.status(500).json({ error: 'Error reviewing document' });
    }
};
exports.reviewDocument = reviewDocument;
const downloadStampedDocument = async (req, res) => {
    try {
        const id = req.params.id;
        const document = await prisma_1.prisma.document.findUnique({ where: { id } });
        if (!document || !document.stampedPath) {
            res.status(404).json({ error: 'Stamped document not found or not approved yet' });
            return;
        }
        res.download(document.stampedPath);
    }
    catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Error downloading document' });
    }
};
exports.downloadStampedDocument = downloadStampedDocument;
