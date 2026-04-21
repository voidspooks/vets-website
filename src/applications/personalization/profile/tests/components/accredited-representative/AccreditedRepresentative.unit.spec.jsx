import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';

import { renderWithStoreAndRouter } from '~/platform/testing/unit/react-testing-library-helpers';
import * as useRepresentativeStatus from 'platform/user/widgets/representative-status/hooks/useRepresentativeStatus';
import { CSP_IDS } from '~/platform/user/authentication/constants';
import mockRepresentativeData from '../../../mock-representative-data.json';
import { formatContactInfo } from '../../../util/formatContactInfo';

import AccreditedRepresentative from '../../../components/accredited-representative/AccreditedRepresentative';

const repData = mockRepresentativeData.data[0];

const { concatAddress, contact, extension, vcfUrl } = formatContactInfo(
  repData.attributes,
);

const stubbedRepresentativeData = {
  id: repData.id,
  poaType: repData.attributes.individualType,
  ...repData.attributes,
  concatAddress,
  contact,
  extension,
  vcfUrl,
};

const getState = ({ isLOA3 = 1 } = {}) => ({
  user: {
    profile: {
      signIn: { serviceName: CSP_IDS.ID_ME },
      loa: { current: isLOA3 },
    },
  },
});

describe('AccreditedRepresentative', () => {
  context('when accredited representative is loading', () => {
    let repStatus;

    beforeEach(() => {
      repStatus = sinon
        .stub(useRepresentativeStatus, 'useRepresentativeStatus')
        .returns({
          representative: null,
          isLoading: true,
          error: null,
        });
    });

    afterEach(() => {
      repStatus.restore();
    });
    it('should render loading', async () => {
      const { getByText, findByTestId } = renderWithStoreAndRouter(
        <AccreditedRepresentative />,
        {
          initialState: {
            ...getState(),
          },
        },
      );
      await findByTestId('loading-rep-status');
      expect(getByText('Accredited representative or VSO'));
    });
  });

  context('when accredited representative exists', () => {
    let repStatus;

    beforeEach(() => {
      repStatus = sinon
        .stub(useRepresentativeStatus, 'useRepresentativeStatus')
        .returns({
          representative: stubbedRepresentativeData,
          isLoading: false,
          error: null,
        });
    });

    afterEach(() => {
      repStatus.restore();
    });
    it('should render CurrentRep', async () => {
      const {
        getByText,
        getAllByRole,
        findByTestId,
      } = renderWithStoreAndRouter(<AccreditedRepresentative />, {
        initialState: {
          ...getState(),
        },
      });
      await findByTestId('current-rep');
      expect(getAllByRole('heading')[0]).to.have.text(
        'Accredited representative or VSO',
      );
      expect(getByText('Your current Veteran Service Organization (VSO)')).to
        .exist;
    });
  });

  context('when no error and no accredited representative exists', () => {
    let repStatus;

    beforeEach(() => {
      repStatus = sinon
        .stub(useRepresentativeStatus, 'useRepresentativeStatus')
        .returns({
          representative: null,
          isLoading: false,
          error: null,
        });
    });

    afterEach(() => {
      repStatus.restore();
    });
    it('should render NoRep', async () => {
      const {
        getAllByRole,
        findByTestId,
        getByText,
      } = renderWithStoreAndRouter(<AccreditedRepresentative />, {
        initialState: {
          ...getState(),
        },
      });

      await findByTestId('no-rep');
      expect(getAllByRole('heading')[0]).to.have.text(
        'Accredited representative or VSO',
      );
      expect(getByText('You don’t have an accredited representative.')).to
        .exist;
    });
  });

  context('when isLOA3 is true', () => {
    let repStatus;

    beforeEach(() => {
      repStatus = sinon
        .stub(useRepresentativeStatus, 'useRepresentativeStatus')
        .returns({
          representative: null,
          isLoading: false,
          error: null,
        });
    });

    afterEach(() => {
      repStatus.restore();
    });
    it('should render NoRep', async () => {
      const {
        getAllByRole,
        findByTestId,
        getByText,
      } = renderWithStoreAndRouter(<AccreditedRepresentative />, {
        initialState: {
          ...getState({ isLOA3: 3 }),
        },
      });

      await findByTestId('no-rep');
      expect(getAllByRole('heading')[0]).to.have.text(
        'Accredited representative or VSO',
      );
      expect(getByText('You don’t have an accredited representative.')).to
        .exist;
    });
  });

  context(
    'when there is an error and no accredited representative exists',
    () => {
      let repStatus;

      beforeEach(() => {
        repStatus = sinon
          .stub(useRepresentativeStatus, 'useRepresentativeStatus')
          .returns({
            representative: null,
            isLoading: false,
            error: 'there is an error',
          });
      });

      afterEach(() => {
        repStatus.restore();
      });
      it('should render UnknownRep', async () => {
        const {
          getAllByRole,
          findByTestId,
          getByText,
        } = renderWithStoreAndRouter(<AccreditedRepresentative />, {
          initialState: {
            ...getState(),
          },
        });
        await findByTestId('unknown-rep');
        expect(getAllByRole('heading')[0]).to.have.text(
          'Accredited representative or VSO',
        );
        expect(
          getByText('We can’t check if you have an accredited representative.'),
        ).to.exist;
      });
    },
  );
});
