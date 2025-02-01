import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import nlp from 'compromise';
import { Image } from 'image-js';
import { FinancialData } from '../types';

// Set worker path using version-specific URL
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href;

export class PDFProcessor {
  private tesseractWorker: Tesseract.Worker | null = null;

  async initialize() {
    this.tesseractWorker = await createWorker('eng');
  }

  private async preprocessImage(imageData: ImageData): Promise<Image> {
    const image = await Image.load(imageData);
    return image
      .grey()
      .contrast({ normalize: true })
      .gaussianFilter({ radius: 1 });
  }

  private async extractTextFromImage(image: Image): Promise<string> {
    if (!this.tesseractWorker) {
      throw new Error('Tesseract worker not initialized');
    }
    const { data: { text } } = await this.tesseractWorker.recognize(await image.toDataURL());
    return text;
  }

  private findFinancialValues(text: string): FinancialData {
    const doc = nlp(text);
    
    // Custom rules to find financial values
    const findAmount = (context: string[]): number | null => {
      const regex = /(?:Rs\.|INR|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:Cr\.?|Crores?|cr\.?)?/i;
      
      for (const term of context) {
        const matches = text.match(new RegExp(`(?:${term}).*?${regex.source}`, 'i'));
        if (matches) {
          const value = parseFloat(matches[1].replace(/,/g, ''));
          return value;
        }
      }
      return null;
    };

    return {
      revenue: findAmount(['revenue', 'sales', 'income', 'turnover']),
      operatingProfit: findAmount(['operating profit', 'EBITDA', 'operating income', 'profit before tax', 'profit/(loss) before tax', 'profit/loss) before tax']),
      netProfit: findAmount(['net profit', 'PAT', 'profit after tax'])
    };
  }

  async processPDF(file: File, onProgress: (progress: number) => void): Promise<FinancialData> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    
    let combinedText = '';
    const numPages = pdf.numPages;
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      
      // Try text extraction first
      const textContent = await page.getTextContent();
      let pageText = textContent.items.map((item: any) => item.str).join(' ');
      
      // If text extraction yields poor results, try OCR
      if (pageText.trim().length < 100) {
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) throw new Error('Could not get canvas context');
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const processedImage = await this.preprocessImage(imageData);
        pageText = await this.extractTextFromImage(processedImage);
      }
      
      combinedText += pageText + ' ';
      onProgress((pageNum / numPages) * 100);
    }
    
    return this.findFinancialValues(combinedText);
  }

  async cleanup() {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
    }
  }
}