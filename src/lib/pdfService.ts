
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Initialize worker
if (typeof window !== 'undefined' && 'Worker' in window) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export async function extractTextFromPdf(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join('\n');
            fullText += pageText + '\n';
        }

        return fullText;
    } catch (error: any) {
        console.error('Error extracting text from PDF:', error);
        throw new Error(error.message || 'Failed to parse PDF');
    }
}
