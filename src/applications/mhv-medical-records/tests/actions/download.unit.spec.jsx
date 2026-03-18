import { expect } from 'chai';
import {
  mockApiRequest,
  mockMultipleApiRequests,
} from '@department-of-veterans-affairs/platform-testing/helpers';
import sinon from 'sinon';
import { waitFor } from '@testing-library/dom';
import {
  updateReportRecordType,
  updateReportDateRange,
  genAndDownloadCCD,
  genAndDownloadCCDV2,
} from '../../actions/downloads';
import { Actions } from '../../util/actionTypes';

describe('Download Actions', () => {
  describe('genAndDownloadCCD', () => {
    let clickToRestore = null;
    beforeEach(() => {
      clickToRestore = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = sinon.spy();
      window.URL = {
        createObjectURL: sinon.stub().returns('test'),
        revokeObjectURL: sinon.spy(),
      };
      window.location = { assign: sinon.spy() };
    });
    afterEach(() => {
      delete window.URL;
      HTMLAnchorElement.prototype.click = clickToRestore;
    });
    it('should dispatch an error on failed API calls', async () => {
      const dispatch = sinon.spy();
      const firstName = 'first';
      const lastName = 'last';
      mockApiRequest([{ status: 'ERROR', dateGenerated: 'date' }]);
      await genAndDownloadCCD(firstName, lastName)(dispatch);
      expect(dispatch.callCount).to.be.equal(3);
      expect(dispatch.thirdCall.args[0].type).to.equal(
        Actions.Downloads.CCD_GENERATION_ERROR,
      );
      expect(dispatch.thirdCall.args[0].response).to.equal('date');
    });

    it('should dispatch a download on successful API calls', async () => {
      const dispatch = sinon.spy();
      const firstName = 'first';
      const lastName = 'last';
      const dateGenerated = '2024-10-30T10:00:40.000-0400';
      const completeRequest = {
        shouldResolve: true,
        response: [{ status: 'COMPLETE', dateGenerated }],
      };
      const downLoadRequest = {
        shouldResolve: true,
        response: {
          ok: true,
          blob: sinon
            .stub()
            .resolves(new Blob(['<ClinicalDocument/>'], { type: '' })),
        },
      };
      mockMultipleApiRequests([completeRequest, downLoadRequest]);
      await genAndDownloadCCD(firstName, lastName)(dispatch);
      expect(dispatch.callCount).to.be.equal(3);
      expect(dispatch.calledWith({ type: Actions.Downloads.GENERATE_CCD })).to
        .be.true;
    });
    it('should call itself recursively until we get a complete status', async () => {
      const dispatch = sinon.spy();
      const firstName = 'first';
      const lastName = 'last';
      const dateGenerated = '2024-10-30T10:00:40.000-0400';
      const inProcessRequest = {
        shouldResolve: true,
        response: [{ status: 'IN_PROCESS', dateGenerated }],
      };
      const completeRequest = {
        shouldResolve: true,
        response: [{ status: 'COMPLETE', dateGenerated }],
      };

      mockMultipleApiRequests([inProcessRequest, completeRequest]);
      await genAndDownloadCCD(firstName, lastName)(dispatch);
      waitFor(() => {
        expect(dispatch.callCount).to.be.equal(2);
        expect(dispatch.calledWith({ type: Actions.Downloads.GENERATE_CCD })).to
          .be.true;
        // expect dispatch to be called with a function
        expect(dispatch.secondCall.args[0]).to.be.a('function');
      });
    });
  });

  describe('updateReportDateRange', () => {
    it('should dispatch an action of type updateReportDateRange', () => {
      const dispatch = sinon.spy();
      const option = 'opt';
      const fromDate = 'from';
      const toDate = 'to';
      updateReportDateRange(option, fromDate, toDate)(dispatch);
      expect(dispatch.calledTwice).to.be.true;
      expect(dispatch.firstCall.args[0].type).to.equal(
        Actions.Downloads.SET_DATE_FILTER,
      );
      expect(dispatch.firstCall.args[0].response).to.deep.equal({
        option,
        fromDate,
        toDate,
      });
    });
  });

  describe('updateReportRecordType', () => {
    it('should dispatch an action of type updateReportRecordType', () => {
      const dispatch = sinon.spy();
      updateReportRecordType({ sample: 'test' })(dispatch);
      expect(dispatch.calledOnce).to.be.true;
      expect(dispatch.firstCall.args[0].type).to.equal(
        Actions.Downloads.SET_RECORD_FILTER,
      );
      expect(dispatch.firstCall.args[0].response).to.deep.equal({
        sample: 'test',
      });
    });
  });

  describe('genAndDownloadCCDV2', () => {
    let clickToRestore = null;

    beforeEach(() => {
      clickToRestore = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = sinon.spy();
      window.URL = {
        createObjectURL: sinon.stub().returns('test-url'),
        revokeObjectURL: sinon.spy(),
      };
    });

    afterEach(() => {
      HTMLAnchorElement.prototype.click = clickToRestore;
      delete window.URL;
    });

    it('dispatches correct actions on successful download', async () => {
      const dispatch = sinon.spy();
      const firstName = 'John';
      const lastName = 'Doe';

      const mockBlob = new Blob(['mock xml data'], {
        type: 'application/xml',
      });

      // genAndDownloadCCDV2 makes 3 sequential API calls:
      // 1. generateCCDV2 -> returns jobId
      // 2. statusCCDV2 -> returns status with format READY
      // 3. downloadCCDV2 -> returns blob response
      const generateRequest = {
        shouldResolve: true,
        response: {
          data: {
            attributes: {
              jobId: 'test-job-id',
              retryAfterSeconds: 0.001,
            },
          },
        },
      };
      const statusRequest = {
        shouldResolve: true,
        response: {
          data: {
            attributes: {
              taskId: '12043',
              xml: 'READY',
              html: 'READY',
              pdf: 'READY',
            },
          },
        },
      };
      const downloadRequest = {
        shouldResolve: true,
        response: {
          blob: sinon.stub().resolves(mockBlob),
        },
      };
      mockMultipleApiRequests([
        generateRequest,
        statusRequest,
        downloadRequest,
      ]);

      await genAndDownloadCCDV2(firstName, lastName, 'xml')(dispatch);

      expect(dispatch.secondCall.args[0].type).to.equal(
        Actions.Downloads.GENERATE_CCD,
      );

      expect(
        dispatch
          .getCalls()
          .some(call => call.args[0].type === Actions.Downloads.DOWNLOAD_CCD),
      ).to.be.true;

      expect(HTMLAnchorElement.prototype.click.called).to.be.true;
    });

    it('includes "OH" in filename', async () => {
      const dispatch = sinon.spy();

      const mockBlob = new Blob(['mock'], { type: 'application/pdf' });

      // genAndDownloadCCDV2 makes 3 sequential API calls
      const generateRequest = {
        shouldResolve: true,
        response: {
          data: {
            attributes: {
              jobId: 'test-job-id',
              retryAfterSeconds: 0.001,
            },
          },
        },
      };
      const statusRequest = {
        shouldResolve: true,
        response: {
          data: {
            attributes: {
              taskId: '12043',
              pdf: 'READY',
            },
          },
        },
      };
      const downloadRequest = {
        shouldResolve: true,
        response: {
          blob: sinon.stub().resolves(mockBlob),
        },
      };
      mockMultipleApiRequests([
        generateRequest,
        statusRequest,
        downloadRequest,
      ]);

      const createElementStub = sinon.stub(document, 'createElement');
      const mockAnchor = {
        href: '',
        download: '',
        click: sinon.spy(),
        remove: sinon.spy(),
      };
      createElementStub.withArgs('a').returns(mockAnchor);

      await genAndDownloadCCDV2('Jane', 'Smith', 'pdf')(dispatch);

      expect(mockAnchor.download).to.include('OH');
      expect(mockAnchor.download).to.include('Jane');
      expect(mockAnchor.download).to.include('Smith');
      expect(mockAnchor.download).to.include('.pdf');

      createElementStub.restore();
    });

    it('handles 404 errors with user-friendly alert', async () => {
      const dispatch = sinon.spy();

      const error404 = new Error('Not found');
      error404.status = 404;
      const mockResponse = {
        blob: sinon.stub().rejects(error404),
      };
      mockApiRequest(mockResponse);

      await genAndDownloadCCDV2('John', 'Doe', 'xml')(dispatch);

      expect(dispatch.secondCall.args[0].type).to.equal(
        Actions.Downloads.GENERATE_CCD,
      );

      expect(dispatch.thirdCall.args[0].type).to.equal(
        Actions.Downloads.CANCEL_CCD,
      );

      expect(dispatch.callCount).to.be.at.least(4);
    });

    it('dispatches CANCEL_CCD on generic errors', async () => {
      const dispatch = sinon.spy();

      const mockResponse = {
        blob: sinon.stub().rejects(new Error('Network error')),
      };
      mockApiRequest(mockResponse);

      await genAndDownloadCCDV2('John', 'Doe', 'html')(dispatch);

      expect(
        dispatch
          .getCalls()
          .some(call => call.args[0].type === Actions.Downloads.CANCEL_CCD),
      ).to.be.true;
    });
  });
});
