import { server } from 'platform/testing/unit/mocha-setup';
import {
  createGetHandler,
  jsonResponse,
} from 'platform/testing/unit/msw-adapter';
import sinon from 'sinon';
import { expect } from 'chai';
import * as platformApi from '@department-of-veterans-affairs/platform-utilities/api';
import {
  ENDPOINTS,
  getAllInquiries,
  getInquiry,
  getInquiryStatus,
  validateAddress,
} from '../../utils/api';

describe('getAllInquiries', () => {
  it('calls the correct endpoint', async () => {
    server.use(
      createGetHandler(ENDPOINTS.inquiries, () =>
        jsonResponse({ key: 'success' }),
      ),
    );

    const res = await getAllInquiries();
    expect(res.key).to.equal('success');
  });
});

describe('getInquiry', () => {
  it('requests correct inquiryId', async () => {
    server.use(
      createGetHandler(`${ENDPOINTS.inquiries}/:inquiryId`, ({ params }) => {
        return jsonResponse({ data: params.inquiryId });
      }),
    );

    const resFail = await getInquiry('failure');
    expect(resFail.data).to.equal('failure');

    const resSucceed = await getInquiry('success');
    expect(resSucceed.data).to.equal('success');
  });
});

describe('getInquiryStatus', () => {
  it('requests correct inquiryId', async () => {
    server.use(
      createGetHandler(
        `${ENDPOINTS.inquiries}/:inquiryId/status`,
        ({ params }) => {
          return jsonResponse({ data: params.inquiryId });
        },
      ),
    );

    const resFail = await getInquiryStatus('failure');
    expect(resFail.data).to.equal('failure');

    const resSucceed = await getInquiryStatus('success');
    expect(resSucceed.data).to.equal('success');
  });
});

describe('validateAddress', () => {
  let apiRequestStub;

  beforeEach(() => {
    apiRequestStub = sinon.stub(platformApi, 'apiRequest').resolves({});
  });

  afterEach(() => {
    apiRequestStub.restore();
  });

  it('sends the correct POST body for a standard address', async () => {
    const address = {
      street: '123 Main St',
      street2: 'Apt 4',
      city: 'Springfield',
      postalCode: '62704',
      state: 'IL',
    };

    await validateAddress(address);

    const [url, options] = apiRequestStub.firstCall.args;
    const body = JSON.parse(options.body);

    expect(url).to.equal(ENDPOINTS.addressValidation);
    expect(options.method).to.equal('POST');
    expect(options.headers['Content-Type']).to.equal('application/json');
    expect(body.address.address_line1).to.equal('123 Main St');
    expect(body.address.address_line2).to.equal('Apt 4');
    expect(body.address.city).to.equal('Springfield');
    expect(body.address.zip_code).to.equal('62704');
    expect(body.address.state_code).to.equal('IL');
    expect(body.address.country_name).to.equal('United States');
    expect(body.address.country_code_iso3).to.equal('USA');
    expect(body.address.address_pou).to.equal('RESIDENCE');
    expect(body.address.address_type).to.equal('DOMESTIC');
  });

  it('uses military address fields when city and state are not provided', async () => {
    const address = {
      street: '123 Military Base',
      postalCode: '09001',
      militaryAddress: {
        militaryPostOffice: 'APO',
        militaryState: 'AE',
      },
    };

    await validateAddress(address);

    const body = JSON.parse(apiRequestStub.firstCall.args[1].body);

    expect(body.address.city).to.equal('APO');
    expect(body.address.state_code).to.equal('AE');
  });

  it('prefers city and state over military address fields', async () => {
    const address = {
      street: '456 Oak Ave',
      city: 'Denver',
      state: 'CO',
      postalCode: '80202',
      militaryAddress: {
        militaryPostOffice: 'APO',
        militaryState: 'AE',
      },
    };

    await validateAddress(address);

    const body = JSON.parse(apiRequestStub.firstCall.args[1].body);

    expect(body.address.city).to.equal('Denver');
    expect(body.address.state_code).to.equal('CO');
  });

  it('handles missing optional fields', async () => {
    const address = {
      street: '789 Elm St',
      city: 'Austin',
      postalCode: '73301',
      state: 'TX',
    };

    await validateAddress(address);

    const body = JSON.parse(apiRequestStub.firstCall.args[1].body);

    expect(body.address.address_line1).to.equal('789 Elm St');
    expect(body.address.address_line2).to.be.undefined;
  });
});
