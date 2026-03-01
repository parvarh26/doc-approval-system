"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stampApprovedPDF = void 0;
const pdf_lib_1 = require("pdf-lib");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const stampApprovedPDF = async (originalPath, filename) => {
    try {
        const existingPdfBytes = await promises_1.default.readFile(originalPath);
        const pdfDoc = await pdf_lib_1.PDFDocument.load(existingPdfBytes);
        const helveticaFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();
        firstPage.drawText('APPROVED', {
            x: width / 2 - 150,
            y: height / 2,
            size: 50,
            font: helveticaFont,
            color: (0, pdf_lib_1.rgb)(1, 0, 0),
            opacity: 0.5,
            rotate: (0, pdf_lib_1.degrees)(45),
        });
        const stampedPdfBytes = await pdfDoc.save();
        const stampedDir = path_1.default.join(process.cwd(), 'uploads', 'stamped');
        await promises_1.default.mkdir(stampedDir, { recursive: true });
        const stampedPath = path_1.default.join(stampedDir, `stamped_${filename}`);
        await promises_1.default.writeFile(stampedPath, stampedPdfBytes);
        return stampedPath;
    }
    catch (error) {
        console.error('Error stamping PDF:', error);
        throw new Error('Failed to stamp PDF');
    }
};
exports.stampApprovedPDF = stampApprovedPDF;
