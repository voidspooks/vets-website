import { expect } from 'chai';

import {
  hasGenericUpdateError,
  isFailedTransaction,
  isPendingTransaction,
  isSuccessfulTransaction,
} from 'platform/user/profile/vap-svc/util/transactions';

describe('isPendingTransaction', () => {
  it('returns `false` if passed nothing', () => {
    expect(isPendingTransaction()).to.be.false;
  });
  it('returns `true` if passed a transaction with a pending status', () => {
    const transaction = {
      data: {
        attributes: {
          transactionStatus: 'RECEIVED',
        },
      },
    };
    expect(isPendingTransaction(transaction)).to.be.true;
    transaction.data.attributes.transactionStatus =
      'RECEIVED_DEAD_LETTER_QUEUE';
    expect(isPendingTransaction(transaction)).to.be.true;
    transaction.data.attributes.transactionStatus = 'RECEIVED_ERROR_QUEUE';
    expect(isPendingTransaction(transaction)).to.be.true;
  });
});

describe('isFailedTransaction', () => {
  it('returns `false` if passed nothing', () => {
    expect(isFailedTransaction()).to.be.false;
  });
  it('returns `true` if passed a transaction with a failed status', () => {
    const transaction = {
      data: {
        attributes: {
          transactionStatus: 'COMPLETED_FAILURE',
        },
      },
    };
    expect(isFailedTransaction(transaction)).to.be.true;
    transaction.data.attributes.transactionStatus = 'REJECTED';
    expect(isFailedTransaction(transaction)).to.be.true;
  });
});

describe('isSuccessfulTransaction', () => {
  it('returns `false` if passed nothing', () => {
    expect(isSuccessfulTransaction()).to.be.false;
  });
  it('returns `true` if passed a transaction with a successful status', () => {
    const transaction = {
      data: {
        attributes: {
          transactionStatus: 'COMPLETED_SUCCESS',
        },
      },
    };
    expect(isSuccessfulTransaction(transaction)).to.be.true;
    transaction.data.attributes.transactionStatus =
      'COMPLETED_NO_CHANGES_DETECTED';
    expect(isSuccessfulTransaction(transaction)).to.be.true;
  });
});

describe('hasGenericUpdateError', () => {
  it('returns `true` when metadata contains CORE103', () => {
    const transaction = {
      data: {
        attributes: {
          metadata: [{ code: 'CORE103' }],
        },
      },
    };

    expect(hasGenericUpdateError(transaction)).to.be.true;
  });

  it('returns `true` when metadata contains VET360_CORE103', () => {
    const transaction = {
      data: {
        attributes: {
          metadata: [{ code: 'VET360_CORE103' }],
        },
      },
    };

    expect(hasGenericUpdateError(transaction)).to.be.true;
  });

  it('returns `false` when metadata does not contain a generic update error code', () => {
    const transaction = {
      data: {
        attributes: {
          metadata: [{ code: 'NOT_A_GENERIC_UPDATE_CODE' }],
        },
      },
    };

    expect(hasGenericUpdateError(transaction)).to.be.false;
  });
});
