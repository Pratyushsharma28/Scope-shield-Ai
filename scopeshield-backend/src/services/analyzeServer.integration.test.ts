import assert from 'node:assert/strict';
import { spawn, ChildProcess } from 'node:child_process';
import { createServer, Server } from 'node:http';
import { AddressInfo } from 'node:net';
import { once } from 'node:events';
import { after, before, test } from 'node:test';

const syntheticClause = 'The agreement covers implementation of a search page.';
const validAssessment = {
  status: 'within_scope',
  summary: 'The request appears to match the agreed search-page implementation.',
  evidence: [{
    clause: syntheticClause,
    explanation: 'The clause expressly covers implementation of a search page.'
  }],
  uncertaintyReasons: [],
  requiresHumanReview: false
};

type GeminiMode = 'valid' | 'failure' | 'rate_limit' | 'timeout' | 'malformed' | 'semantic' | 'unsupported_evidence';

let mode: GeminiMode = 'valid';
let geminiServer: Server;
let appProcess: ChildProcess;
let baseUrl: string;
let frontendOrigin: string;
let geminiUrl: string;
let childOutput = '';

async function listen(server: Server): Promise<number> {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return (server.address() as AddressInfo).port;
}

async function reservePort(): Promise<number> {
  const server = createServer();
  const port = await listen(server);
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}

async function waitForServer(url: string): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`ScopeShield server did not become healthy: ${String(lastError)} ${childOutput}`);
}

function makeTextPdf(text: string): Buffer {
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
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'binary');
}

async function analyze(options: {
  filename?: string;
  mimetype?: string;
  contents?: Buffer | string;
  clientRequest?: string;
  estimatedExtraHours?: string;
  hourlyRate?: string;
} = {}) {
  const form = new FormData();
  if (options.filename !== undefined) {
    const data = Buffer.isBuffer(options.contents)
      ? new Uint8Array(options.contents)
      : new TextEncoder().encode(options.contents ?? syntheticClause);
    form.append(
      'contract',
      new Blob([data], { type: options.mimetype ?? 'text/plain' }),
      options.filename
    );
  }
  if (options.clientRequest !== undefined) {
    form.append('clientRequest', options.clientRequest);
  }
  if (options.estimatedExtraHours !== undefined) {
    form.append('estimatedExtraHours', options.estimatedExtraHours);
  }
  if (options.hourlyRate !== undefined) {
    form.append('hourlyRate', options.hourlyRate);
  }

  return fetch(`${baseUrl}/api/analyze`, { method: 'POST', body: form });
}

async function sendValidTxt() {
  return analyze({
    filename: 'synthetic-contract.txt',
    contents: syntheticClause,
    clientRequest: 'Please implement the search page.',
    estimatedExtraHours: '1.25',
    hourlyRate: '100.25'
  });
}

before(async () => {
  geminiServer = createServer((req, res) => {
    if (mode === 'timeout') {
      setTimeout(() => {
        if (!res.destroyed) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end('{}');
        }
      }, 1_000);
      return;
    }
    if (mode === 'failure' || mode === 'rate_limit') {
      res.writeHead(mode === 'rate_limit' ? 429 : 500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { message: 'synthetic upstream failure' } }));
      return;
    }

    let responseText: string;
    if (mode === 'malformed') {
      responseText = '{not-json';
    } else if (mode === 'semantic') {
      responseText = JSON.stringify({ status: 'outside', summary: 'bad', evidence: [] });
    } else {
      responseText = JSON.stringify({
        ...validAssessment,
        evidence: mode === 'unsupported_evidence'
          ? [{ clause: 'Fabricated contract clause.', explanation: 'Synthetic invalid evidence.' }]
          : validAssessment.evidence
      });
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      candidates: [{
        content: { role: 'model', parts: [{ text: responseText }] },
        finishReason: 'STOP'
      }]
    }));
    void req.resume();
  });
  const geminiPort = await listen(geminiServer);
  geminiUrl = `http://127.0.0.1:${geminiPort}`;

  const appPort = await reservePort();
  baseUrl = `http://127.0.0.1:${appPort}`;
  frontendOrigin = 'http://localhost:4187';
  appProcess = spawn(process.execPath, ['--import', 'tsx', 'src/server.ts'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(appPort),
      FRONTEND_ORIGIN: frontendOrigin,
      GEMINI_API_KEY: 'qa-only-not-a-real-key',
      GEMINI_MODEL: 'gemini-2.5-flash',
      GEMINI_TIMEOUT_MS: '200',
      GEMINI_API_BASE_URL: geminiUrl,
      ANALYZE_RATE_LIMIT_MAX_REQUESTS: '100'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  appProcess.stdout?.on('data', chunk => { childOutput += chunk.toString(); });
  appProcess.stderr?.on('data', chunk => { childOutput += chunk.toString(); });
  await waitForServer(`${baseUrl}/api/health`);
});

after(async () => {
  if (appProcess && appProcess.exitCode === null) {
    const exited = once(appProcess, 'exit');
    appProcess.kill('SIGTERM');
    await exited;
  }
  if (geminiServer?.listening) {
    await new Promise<void>((resolve, reject) => {
      geminiServer.close(error => error ? reject(error) : resolve());
      geminiServer.closeAllConnections();
    });
  }
});

test('QA exercises the live HTTP server with synthetic contracts and a local Gemini stub', async t => {
  await t.test('health returns success JSON', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok', service: 'ScopeShield AI' });
  });

  await t.test('valid TXT reaches Gemini and returns validated deterministic INR pricing', async () => {
    mode = 'valid';
    const response = await sendValidTxt();
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.status, 'within_scope');
    assert.equal(body.estimatedExtraHours, 1.25);
    assert.equal(body.hourlyRate, 100.25);
    assert.equal(body.estimatedExtraCost, 125.31);
    assert.equal(body.currency, 'INR');
  });

  await t.test('valid text-based PDF reaches Gemini', async () => {
    mode = 'valid';
    const response = await analyze({
      filename: 'synthetic-contract.pdf',
      mimetype: 'application/pdf',
      contents: makeTextPdf(syntheticClause),
      clientRequest: 'Please implement the search page.',
      estimatedExtraHours: '1',
      hourlyRate: '250'
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).status, 'within_scope');
  });

  await t.test('missing contract is rejected', async () => {
    const response = await analyze({
      clientRequest: 'Implement search.',
      estimatedExtraHours: '1',
      hourlyRate: '250'
    });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, 'CONTRACT_REQUIRED');
  });

  await t.test('empty client request is rejected', async () => {
    const response = await analyze({
      filename: 'synthetic-contract.txt',
      clientRequest: '',
      estimatedExtraHours: '1',
      hourlyRate: '250'
    });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, 'INVALID_REQUEST');
  });

  await t.test('unsupported extension and MIME types are rejected', async () => {
    const extensionResponse = await analyze({
      filename: 'contract.docx',
      mimetype: 'application/octet-stream',
      clientRequest: 'Implement search.',
      estimatedExtraHours: '1',
      hourlyRate: '250'
    });
    assert.equal(extensionResponse.status, 400);
    assert.equal((await extensionResponse.json()).error.code, 'UNSUPPORTED_FILE_TYPE');

    const mimeResponse = await analyze({
      filename: 'contract.txt',
      mimetype: 'application/pdf',
      clientRequest: 'Implement search.',
      estimatedExtraHours: '1',
      hourlyRate: '250'
    });
    assert.equal(mimeResponse.status, 400);
    assert.equal((await mimeResponse.json()).error.code, 'UNSUPPORTED_FILE_TYPE');
  });

  await t.test('file exceeding configured size limit is rejected', async () => {
    const response = await analyze({
      filename: 'large.txt',
      contents: Buffer.alloc(10 * 1024 * 1024 + 1, 0x41),
      clientRequest: 'Implement search.',
      estimatedExtraHours: '1',
      hourlyRate: '250'
    });
    assert.equal(response.status, 413);
    assert.equal((await response.json()).error.code, 'FILE_TOO_LARGE');
  });

  await t.test('empty and unreadable contract text are rejected', async () => {
    const emptyResponse = await analyze({
      filename: 'empty.txt',
      contents: '',
      clientRequest: 'Implement search.',
      estimatedExtraHours: '1',
      hourlyRate: '250'
    });
    assert.equal(emptyResponse.status, 400);
    assert.equal((await emptyResponse.json()).error.code, 'INVALID_CONTRACT');

    const unreadableResponse = await analyze({
      filename: 'binary.txt',
      contents: Buffer.from([0x66, 0x00, 0x6f]),
      clientRequest: 'Implement search.',
      estimatedExtraHours: '1',
      hourlyRate: '250'
    });
    assert.equal(unreadableResponse.status, 400);
    assert.equal((await unreadableResponse.json()).error.code, 'INVALID_CONTRACT');
  });

  await t.test('Gemini API failure and rate limiting return errors, not successful analysis', async () => {
    mode = 'failure';
    const failure = await sendValidTxt();
    assert.equal(failure.status, 502);
    assert.equal((await failure.json()).error.code, 'UPSTREAM_ERROR');

    mode = 'rate_limit';
    const rateLimit = await sendValidTxt();
    assert.equal(rateLimit.status, 503);
    assert.equal((await rateLimit.json()).error.code, 'UPSTREAM_RATE_LIMITED');
  });

  await t.test('Gemini timeout returns a gateway timeout error', async () => {
    mode = 'timeout';
    const response = await sendValidTxt();
    assert.equal(response.status, 504);
    assert.equal((await response.json()).error.code, 'REQUEST_TIMEOUT');
  });

  await t.test('malformed and semantically invalid AI responses are rejected', async () => {
    mode = 'malformed';
    const malformed = await sendValidTxt();
    assert.equal(malformed.status, 502);
    assert.equal((await malformed.json()).error.code, 'UPSTREAM_ERROR');

    mode = 'semantic';
    const invalid = await sendValidTxt();
    assert.equal(invalid.status, 502);
    assert.equal((await invalid.json()).error.code, 'UPSTREAM_ERROR');
  });

  await t.test('evidence absent from the source contract is rejected', async () => {
    mode = 'unsupported_evidence';
    const response = await sendValidTxt();
    assert.equal(response.status, 502);
    assert.equal((await response.json()).error.code, 'UPSTREAM_ERROR');
  });

  await t.test('negative, non-finite, and excessive pricing inputs are rejected', async () => {
    for (const [hours, rate] of [
      ['-1', '100'],
      ['1', '-1'],
      ['Infinity', '100'],
      ['501', '100'],
      ['1', '100001']
    ]) {
      const response = await analyze({
        filename: 'contract.txt',
        clientRequest: 'Implement search.',
        estimatedExtraHours: hours,
        hourlyRate: rate
      });
      assert.equal(response.status, 400);
      assert.equal((await response.json()).error.code, 'INVALID_REQUEST');
    }
  });

  await t.test('CORS allows configured origin and blocks unknown preflight origins', async () => {
    const allowed = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: frontendOrigin }
    });
    assert.equal(allowed.headers.get('access-control-allow-origin'), frontendOrigin);

    const denied = await fetch(`${baseUrl}/api/analyze`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://not-the-frontend.example',
        'Access-Control-Request-Method': 'POST'
      }
    });
    assert.equal(denied.status, 403);
    assert.equal((await denied.json()).error.code, 'CORS_ORIGIN_DENIED');
  });

  await t.test('unexpected routes and malformed JSON return sanitized JSON errors', async () => {
    const notFound = await fetch(`${baseUrl}/api/does-not-exist`);
    assert.equal(notFound.status, 404);
    assert.deepEqual(await notFound.json(), {
      error: { code: 'NOT_FOUND', message: 'The requested endpoint was not found.' }
    });

    const malformedJson = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid json'
    });
    assert.equal(malformedJson.status, 400);
    const errorBody = await malformedJson.json();
    assert.equal(errorBody.error.code, 'INVALID_REQUEST');
    assert.equal(JSON.stringify(errorBody).includes('SyntaxError'), false);
    assert.equal(JSON.stringify(errorBody).includes('stack'), false);
  });

  await t.test('unexpected multipart parser errors return a sanitized server error', async () => {
    const response = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data; boundary=qa-boundary' },
      body: '--qa-boundary\r\nContent-Disposition: form-data; name="contract"; filename="contract.txt"\r\n' +
        'Content-Type: text/plain\r\n\r\nSynthetic partial upload'
    });
    assert.equal(response.status, 500);
    const body = await response.json();
    assert.deepEqual(body, {
      error: { code: 'INTERNAL_ERROR', message: 'The request could not be completed.' }
    });
    assert.equal(JSON.stringify(body).includes('Synthetic partial upload'), false);
    assert.equal(JSON.stringify(body).includes('stack'), false);
  });
});
