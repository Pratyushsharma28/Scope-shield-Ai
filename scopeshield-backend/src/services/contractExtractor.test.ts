import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ContractInputError,
  extractContractText,
  UnsupportedContractError
} from './contractExtractor.js';

function uploadedFile(
  name: string,
  mimetype: string,
  contents: Buffer | string
): Express.Multer.File {
  const buffer = Buffer.isBuffer(contents) ? contents : Buffer.from(contents, 'utf8');
  return {
    fieldname: 'contract',
    originalname: name,
    encoding: '7bit',
    mimetype,
    size: buffer.length,
    destination: '',
    filename: name,
    path: '',
    buffer,
    stream: undefined as never
  };
}

function textPdf(text: string): Buffer {
  const escaped = text.replace(/([\\()])/g, '\\$1');
  const stream = `BT /F1 12 Tf 72 720 Td (${escaped}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Resources << /Font << /F1 5 0 R >> >>\n/Contents 4 0 R\n>>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (const offset of offsets.slice(1)) {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'binary');
}

test('extracts readable text from a UTF-8 TXT contract', async () => {
  const text = await extractContractText(
    uploadedFile('contract.txt', 'text/plain', '  Website design and delivery.  \n')
  );
  assert.equal(text, 'Website design and delivery.');
});

test('extracts readable text from a text-based PDF contract', async () => {
  const pdf = textPdf('Contract includes website design.');
  const text = await extractContractText(
    uploadedFile('contract.pdf', 'application/pdf', pdf)
  );
  assert.match(text, /Contract includes website design\./);
});

test('rejects an empty contract file', async () => {
  await assert.rejects(
    extractContractText(uploadedFile('empty.txt', 'text/plain', Buffer.alloc(0))),
    { name: 'ContractInputError', message: 'The uploaded contract file is empty.' }
  );
});

test('rejects unsupported contract file types', async () => {
  await assert.rejects(
    extractContractText(uploadedFile('contract.docx', 'application/octet-stream', 'not a contract')),
    UnsupportedContractError
  );
});

test('rejects encrypted PDFs with a useful error', async () => {
  const encryptedPdf = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n' +
    '2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\n' +
    'trailer\n<< /Root 1 0 R /Encrypt 3 0 R >>\n%%EOF'
  );
  await assert.rejects(
    extractContractText(uploadedFile('encrypted.pdf', 'application/pdf', encryptedPdf)),
    (error: unknown) => error instanceof ContractInputError && /encrypted|password-protected/i.test(error.message)
  );
});
