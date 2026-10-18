import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api.js';

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_CONTRACT_CHARACTERS = 100_000;

export class ContractInputError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ContractInputError';
  }
}
export class UnsupportedContractError extends Error {
  constructor(message = 'Contract must be a PDF or TXT file.') {
    super(message);
    this.name = 'UnsupportedContractError';
  }
}

export async function extractContractText(file: Express.Multer.File): Promise<string> {
  if (file.buffer.length === 0) {
    throw new ContractInputError('The uploaded contract file is empty.');
  }
  if (file.buffer.length > MAX_FILE_SIZE) {
    throw new ContractInputError('Contract file must be 10 MB or smaller.');
  }

  const extension = file.originalname.toLowerCase().split('.').pop();
  const mimeType = file.mimetype.toLowerCase().split(';')[0]?.trim();
  const isPdf = extension === 'pdf' && mimeType === 'application/pdf';
  const isTxt = extension === 'txt' && mimeType === 'text/plain';

  if (!isPdf && !isTxt) {
    throw new UnsupportedContractError('Contract must be a PDF or TXT file.');
  }

  let text: string;

  if (isPdf) {
    if (file.buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
      throw new ContractInputError('The uploaded file is not a valid PDF.');
    }
    if (/trailer\s*<<[\s\S]*?\/Encrypt\s+\d+\s+\d+\s+R/.test(file.buffer.toString('latin1'))) {
      throw new ContractInputError('The PDF is encrypted or password-protected. Upload an unencrypted PDF.');
    }

    let document: PDFDocumentProxy | undefined;
    try {
      document = await getDocument({
        data: new Uint8Array(file.buffer),
        isEvalSupported: false,
        useSystemFonts: true
      }).promise;

      const pages: string[] = [];
      let extractedCharacters = 0;
      for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
        const page = await document.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => {
          if (!('str' in item)) {
            return '';
          }
          const value = `${item.str}${item.hasEOL ? '\n' : ' '}`;
          extractedCharacters += value.length;
          if (extractedCharacters > MAX_CONTRACT_CHARACTERS) {
            throw new ContractInputError('The extracted contract text exceeds the 100,000-character limit.');
          }
          return value;
        }).join('');
        pages.push(pageText);
      }
      text = pages.join('\n');
    } catch (error) {
      if (error instanceof ContractInputError) {
        throw error;
      }
      if (isEncryptedPdfError(error)) {
        throw new ContractInputError('The PDF is encrypted or password-protected. Upload an unencrypted PDF.');
      }
      throw new ContractInputError('Unable to extract readable text from the PDF contract.');
    } finally {
      await document?.destroy();
    }
  } else {
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(file.buffer);
    } catch {
      throw new ContractInputError('The TXT contract must be valid UTF-8 text.');
    }
    if (text.includes('\u0000')) {
      throw new ContractInputError('The TXT contract contains unreadable binary data.');
    }
  }

  const normalized = text.trim();
  if (!normalized) {
    throw new ContractInputError('No readable text was found in the uploaded contract.');
  }
  if (normalized.length > MAX_CONTRACT_CHARACTERS) {
    throw new ContractInputError('The extracted contract text exceeds the 100,000-character limit.');
  }
  return normalized;
}

function isEncryptedPdfError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  return /encrypt|password/i.test(`${error.name} ${error.message}`);
}
