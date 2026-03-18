const fs = require('fs');
const { claimsStore } = require('../mockStore');

/**
 * Upload a document to a claim (e.g. proof of attendance)
 * POST /travel_pay/v0/claims/:claimId/documents
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

    const newDocument = {
      documentId: 'mock-poa-document-id-001',
      claimId,
      filename: req.body.fileName || 'proof-of-attendance.pdf',
      mimetype: req.body.contentType || 'application/pdf',
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
    return res.status(200).json({ id: req.params.documentId });
  };
}

/**
 * Download a document from a claim
 * GET /travel_pay/v0/claims/:claimId/documents/:docId
 */
function downloadDocumentHandler() {
  return (req, res) => {
    // Error condition for screenshot-2 from the mock data
    if (req.params.docId === '12fcfecc-5132-4c16-8a9a-7af07b714cd4') {
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
