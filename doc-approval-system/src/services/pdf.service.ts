import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

export const stampApprovedPDF = async (originalPath: string, filename: string): Promise<string> => {
    try {
        const existingPdfBytes = await fs.readFile(originalPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        firstPage.drawText('APPROVED', {
            x: width / 2 - 150,
            y: height / 2,
            size: 50,
            font: helveticaFont,
            color: rgb(1, 0, 0),
            opacity: 0.5,
            rotate: degrees(45),
        });

        const stampedPdfBytes = await pdfDoc.save();

        const stampedDir = path.join(process.cwd(), 'uploads', 'stamped');
        await fs.mkdir(stampedDir, { recursive: true });

        const stampedPath = path.join(stampedDir, `stamped_${filename}`);
        await fs.writeFile(stampedPath, stampedPdfBytes);

        return stampedPath;
    } catch (error) {
        console.error('Error stamping PDF:', error);
        throw new Error('Failed to stamp PDF');
    }
};
