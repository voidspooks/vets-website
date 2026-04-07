const fs = require('fs');
const { claimsStore } = require('../mockStore');

/**
 * Extracts filename and mimetype from a raw multipart/form-data Buffer.
 *
 * mocker-api is configured (via _proxy.bodyParserConf) to read multipart
 * requests as raw Buffers, so req.body is a Buffer here — no stream listeners
 * needed and no async handler required.
 *
 * @param {Buffer|*} body - req.body provided by bodyParser.raw()
 * @returns {{ filename: string, mimetype: string } | null}
 */
function parseMultipartBody(body) {
  if (!Buffer.isBuffer(body)) return null;
  // latin1 round-trips binary bytes through a JS string without corruption
  const raw = body.toString('latin1');
  const filenameMatch = raw.match(
    /Content-Disposition:[^\r\n]*filename="([^"]+)"/i,
  );
  const mimeMatch = raw.match(
    /Content-Disposition:[^\r\n]*\r\nContent-Type:\s*([^\r\n]+)/i,
  );
  return {
    filename: filenameMatch ? filenameMatch[1] : 'upload',
    mimetype: mimeMatch ? mimeMatch[1].trim() : 'application/octet-stream',
  };
}

/**
 * Upload a document to a claim (e.g. proof of attendance)
 * POST /travel_pay/v0/claims/:claimId/documents
 *
 * Accepts multipart/form-data with the file under the key "document".
 * req.body is a Buffer (mocker-api is configured with bodyParserConf:
 * { 'multipart/form-data': 'raw' }).
 */
function uploadDocumentHandler() {
  return (req, res) => {
    const { claimId } = req.params;

    if (!claimsStore[claimId]) {
      claimsStore[claimId] = {
        id: claimId,
        claimId,
        claimNumber: `TC${Math.floor(Math.random() * 1_000_000_000)}`,
        claimStatus: 'InProgress',
        expenses: [],
        documents: [],
      };
    }

    // req.body is a Buffer for multipart; an object for JSON (legacy/tests)
    const multipart = parseMultipartBody(req.body);
    const filename = multipart
      ? multipart.filename
      : (req.body || {}).fileName || 'proof-of-attendance.pdf';
    const mimetype = multipart
      ? multipart.mimetype
      : (req.body || {}).contentType || 'application/pdf';

    const newDocument = {
      documentId: `mock-doc-${Date.now()}`,
      claimId,
      filename,
      mimetype,
      // Binary data not stored; downloads fall back to the sample file.
      fileData: null,
    };

    if (!claimsStore[claimId].documents) {
      claimsStore[claimId].documents = [];
    }
    claimsStore[claimId].documents.push(newDocument);

    return res.status(200).json(newDocument);
  };
}

/**
 * Delete a document from a claim
 * DELETE /travel_pay/v0/claims/:claimId/documents/:documentId
 */
function deleteDocumentHandler() {
  return (req, res) => {
    const { claimId, documentId } = req.params;

    if (claimsStore[claimId]?.documents) {
      claimsStore[claimId].documents = claimsStore[claimId].documents.filter(
        doc => doc.documentId !== documentId,
      );
    }

    return res.status(200).json({ id: documentId });
  };
}

/**
 * Download a document from a claim
 * GET /travel_pay/v0/claims/:claimId/documents/:docId
 */
function downloadDocumentHandler() {
  return (req, res) => {
    const { docId } = req.params;

    // Error condition for screenshot-2 from the mock data
    if (docId === '12fcfecc-5132-4c16-8a9a-7af07b714cd4') {
      return res.status(503).json({
        errors: [
          {
            title: 'Service unavailable',
            status: 503,
            detail: 'An unknown error has occured.',
            code: 'VA900',
          },
        ],
      });
    }

    // Find the stored document across all claims so we can return the actual uploaded file
    const storedDoc = Object.values(claimsStore)
      .flatMap(claim => claim.documents || [])
      .find(doc => doc.documentId === docId);

    if (storedDoc?.fileData) {
      const buffer = Buffer.from(storedDoc.fileData, 'base64');
      res.writeHead(200, {
        'Content-Disposition': `attachment; filename="${storedDoc.filename}"`,
        'Content-Type': storedDoc.mimetype || 'application/octet-stream',
        'Content-Length': buffer.length,
      });
      return res.end(buffer);
    }

    // Fall back to the sample file for pre-seeded documents that have no stored data
    const docx = fs.readFileSync(
      'src/applications/travel-pay/services/mocks/sample-decision-letter.docx',
    );
    res.writeHead(200, {
      'Content-Disposition': 'attachment; filename="Rejection Letter.docx"',
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Length': docx.length,
    });
    return res.end(Buffer.from(docx, 'binary'));
  };
}

module.exports = {
  uploadDocumentHandler,
  deleteDocumentHandler,
  downloadDocumentHandler,
};
