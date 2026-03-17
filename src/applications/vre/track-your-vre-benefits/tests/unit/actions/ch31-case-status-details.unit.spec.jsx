import { expect } from 'chai';
import sinon from 'sinon';
import * as api from '@department-of-veterans-affairs/platform-utilities/api';
import environment from 'platform/utilities/environment';
import * as helpers from '../../../helpers';
import {
  CH31_CASE_STATUS_DETAILS_FETCH_STARTED,
  CH31_CASE_STATUS_DETAILS_FETCH_SUCCEEDED,
  CH31_CASE_STATUS_DETAILS_FETCH_FAILED,
  CH31_CASE_STATUS_DETAILS_ERROR_400_BAD_REQUEST,
  CH31_CASE_STATUS_DETAILS_ERROR_403_FORBIDDEN,
  CH31_CASE_STATUS_DETAILS_ERROR_500_SERVER,
  CH31_CASE_STATUS_DETAILS_ERROR_503_UNAVAILABLE,
  CH31_PDF_LETTER_DOWNLOAD_STARTED,
  CH31_PDF_LETTER_DOWNLOAD_SUCCEEDED,
  CH31_PDF_LETTER_DOWNLOAD_FAILED,
  CH31_PDF_LETTER_DOWNLOAD_ERROR_400_BAD_REQUEST,
  CH31_PDF_LETTER_DOWNLOAD_ERROR_403_FORBIDDEN,
  CH31_PDF_LETTER_DOWNLOAD_ERROR_500_SERVER,
  CH31_PDF_LETTER_DOWNLOAD_ERROR_503_UNAVAILABLE,
  CH31_PDF_LETTER_DOWNLOAD_ERROR_404_NOT_FOUND,
} from '../../../constants';
import {
  fetchCh31CaseStatusDetails,
  downloadCh31PdfLetter,
} from '../../../actions/ch31-case-status-details';

describe('ch31-case-status-details actions', () => {
  let apiStub;
  let dispatch;
  let downloadPdfBlobStub;

  beforeEach(() => {
    apiStub = sinon.stub(api, 'apiRequest');
    dispatch = sinon.spy();
    downloadPdfBlobStub = null;
  });

  afterEach(() => {
    apiStub.restore();

    if (downloadPdfBlobStub) {
      downloadPdfBlobStub.restore();
    }
  });

  describe('fetchCh31CaseStatusDetails', () => {
    it('dispatches STARTED and SUCCEEDED on successful GET', async () => {
      const mockResponse = { data: { id: '12345' } };
      apiStub.resolves(mockResponse);

      await fetchCh31CaseStatusDetails()(dispatch);

      expect(apiStub.calledOnce).to.be.true;
      expect(apiStub.firstCall.args[0]).to.equal(
        `${environment.API_URL}/vre/v0/ch31_case_details`,
      );
      expect(dispatch.firstCall.args[0]).to.deep.equal({
        type: CH31_CASE_STATUS_DETAILS_FETCH_STARTED,
      });
      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: CH31_CASE_STATUS_DETAILS_FETCH_SUCCEEDED,
        payload: mockResponse.data,
      });
    });

    it('dispatches the mapped error action for a handled status code', async () => {
      apiStub.rejects({ errors: [{ status: '403', title: 'Forbidden' }] });

      await fetchCh31CaseStatusDetails()(dispatch);

      expect(dispatch.firstCall.args[0].type).to.equal(
        CH31_CASE_STATUS_DETAILS_FETCH_STARTED,
      );
      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: CH31_CASE_STATUS_DETAILS_ERROR_403_FORBIDDEN,
        error: {
          status: 403,
          messages: ['Forbidden'],
        },
      });
    });

    it('maps a 504 response to the 500 error action', async () => {
      apiStub.rejects({
        errors: [{ status: '504', title: 'Gateway timeout' }],
      });

      await fetchCh31CaseStatusDetails()(dispatch);

      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: CH31_CASE_STATUS_DETAILS_ERROR_500_SERVER,
        error: {
          status: 504,
          messages: ['Gateway timeout'],
        },
      });
    });

    it('falls back to the generic failed action when status is not mapped', async () => {
      apiStub.rejects({ message: 'Network down' });

      await fetchCh31CaseStatusDetails()(dispatch);

      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: CH31_CASE_STATUS_DETAILS_FETCH_FAILED,
        error: {
          status: null,
          messages: ['Unknown error'],
        },
      });
    });

    // -------------------------------------------------------------------------
    // Branch coverage
    // -------------------------------------------------------------------------

    it('maps a 400 response to the 400 error action', async () => {
      apiStub.rejects({ errors: [{ status: '400', title: 'Bad request' }] });

      await fetchCh31CaseStatusDetails()(dispatch);

      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: CH31_CASE_STATUS_DETAILS_ERROR_400_BAD_REQUEST,
        error: { status: 400, messages: ['Bad request'] },
      });
    });

    it('maps a 503 response to the 503 error action', async () => {
      apiStub.rejects({
        errors: [{ status: '503', title: 'Service unavailable' }],
      });

      await fetchCh31CaseStatusDetails()(dispatch);

      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: CH31_CASE_STATUS_DETAILS_ERROR_503_UNAVAILABLE,
        error: { status: 503, messages: ['Service unavailable'] },
      });
    });

    it('falls back to "Network error" when no message is available', async () => {
      const extractMessagesStub = sinon
        .stub(helpers, 'extractMessages')
        .returns([]);
      apiStub.rejects({});

      await fetchCh31CaseStatusDetails()(dispatch);

      expect(dispatch.secondCall.args[0].error.messages).to.deep.equal([
        'Network error',
      ]);

      extractMessagesStub.restore();
    });
  });

  describe('downloadCh31PdfLetter', () => {
    it('dispatches FAILED immediately when the case id is missing', async () => {
      await downloadCh31PdfLetter()(dispatch);

      expect(apiStub.notCalled).to.be.true;
      expect(dispatch.firstCall.args[0]).to.deep.equal({
        type: CH31_PDF_LETTER_DOWNLOAD_STARTED,
      });
      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: CH31_PDF_LETTER_DOWNLOAD_FAILED,
        error: {
          status: null,
          messages: ['Missing case ID'],
        },
      });
    });

    it('dispatches STARTED and SUCCEEDED on a successful PDF download', async () => {
      const blob = new Blob(['pdf content'], { type: 'application/pdf' });
      const response = { blob: sinon.stub().resolves(blob) };
      downloadPdfBlobStub = sinon.stub(helpers, 'downloadPdfBlob');

      apiStub.resolves(response);

      await downloadCh31PdfLetter('ABC123')(dispatch);

      const [url, options] = apiStub.firstCall.args;
      expect(url).to.equal(`${environment.API_URL}/vre/v0/case_get_document`);
      expect(options.method).to.equal('POST');
      expect(options.headers['Content-Type']).to.equal('application/json');
      expect(JSON.parse(options.body)).to.deep.equal({
        resCaseId: 'ABC123',
        documentType: 626,
      });
      expect(response.blob.calledOnce).to.be.true;
      expect(downloadPdfBlobStub.calledOnce).to.be.true;
      expect(downloadPdfBlobStub.firstCall.args).to.deep.equal([
        blob,
        'ch31_discontinued_letter_ABC123.pdf',
      ]);
      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: CH31_PDF_LETTER_DOWNLOAD_SUCCEEDED,
        payload: { resCaseId: 'ABC123' },
      });
    });

    it('dispatches the mapped error action on download failure', async () => {
      apiStub.rejects({ errors: [{ status: '400', title: 'Bad request' }] });

      await downloadCh31PdfLetter('ABC123')(dispatch);

      expect(dispatch.firstCall.args[0].type).to.equal(
        CH31_PDF_LETTER_DOWNLOAD_STARTED,
      );
      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: CH31_PDF_LETTER_DOWNLOAD_ERROR_400_BAD_REQUEST,
        error: {
          status: 400,
          messages: ['Bad request'],
        },
      });
    });

    // -------------------------------------------------------------------------
    // Branch coverage
    // -------------------------------------------------------------------------

    it('maps a 403 response to the 403 error action', async () => {
      apiStub.rejects({ errors: [{ status: '403', title: 'Forbidden' }] });

      await downloadCh31PdfLetter('ABC123')(dispatch);

      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: CH31_PDF_LETTER_DOWNLOAD_ERROR_403_FORBIDDEN,
        error: { status: 403, messages: ['Forbidden'] },
      });
    });

    it('maps a 404 response to the 404 error action', async () => {
      apiStub.rejects({ errors: [{ status: '404', title: 'Not found' }] });

      await downloadCh31PdfLetter('ABC123')(dispatch);

      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: CH31_PDF_LETTER_DOWNLOAD_ERROR_404_NOT_FOUND,
        error: { status: 404, messages: ['Not found'] },
      });
    });

    it('maps a 500 response to the 500 error action', async () => {
      apiStub.rejects({ errors: [{ status: '500', title: 'Server error' }] });

      await downloadCh31PdfLetter('ABC123')(dispatch);

      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: CH31_PDF_LETTER_DOWNLOAD_ERROR_500_SERVER,
        error: { status: 500, messages: ['Server error'] },
      });
    });

    it('maps a 503 response to the 503 error action', async () => {
      apiStub.rejects({
        errors: [{ status: '503', title: 'Service unavailable' }],
      });

      await downloadCh31PdfLetter('ABC123')(dispatch);

      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: CH31_PDF_LETTER_DOWNLOAD_ERROR_503_UNAVAILABLE,
        error: { status: 503, messages: ['Service unavailable'] },
      });
    });

    it('maps a 504 response to the 500 error action', async () => {
      apiStub.rejects({
        errors: [{ status: '504', title: 'Gateway timeout' }],
      });

      await downloadCh31PdfLetter('ABC123')(dispatch);

      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: CH31_PDF_LETTER_DOWNLOAD_ERROR_500_SERVER,
        error: { status: 504, messages: ['Gateway timeout'] },
      });
    });

    it('falls back to the generic failed action when status is not mapped', async () => {
      const extractMessagesStub = sinon
        .stub(helpers, 'extractMessages')
        .returns([]);
      apiStub.rejects({ message: 'Connection refused' });

      await downloadCh31PdfLetter('ABC123')(dispatch);

      expect(dispatch.secondCall.args[0].type).to.equal(
        CH31_PDF_LETTER_DOWNLOAD_FAILED,
      );
      expect(dispatch.secondCall.args[0].error.messages).to.deep.equal([
        'Connection refused',
      ]);

      extractMessagesStub.restore();
    });

    it('falls back to "Network error" when no message is available', async () => {
      const extractMessagesStub = sinon
        .stub(helpers, 'extractMessages')
        .returns([]);
      apiStub.rejects({});

      await downloadCh31PdfLetter('ABC123')(dispatch);

      expect(dispatch.secondCall.args[0].error.messages).to.deep.equal([
        'Network error',
      ]);

      extractMessagesStub.restore();
    });
  });
});
