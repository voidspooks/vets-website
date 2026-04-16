import React from 'react';
import {
  titleUI,
  currentOrPastDateUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import {
  CancelButton,
  fullNameNoSuffixWithAsciiUI,
  fullNameNoSuffixWithAsciiSchema,
} from '../../../helpers';
import { DATE_SCHEMA } from '../../../constants';

export const schema = {
  type: 'object',
  properties: {
    reportDivorce: {
      type: 'object',
      properties: {
        fullName: fullNameNoSuffixWithAsciiSchema,
        birthDate: DATE_SCHEMA,
        'view:cancelDivorce': {
          type: 'object',
          properties: {},
        },
      },
    },
  },
};

export const uiSchema = {
  reportDivorce: {
    ...titleUI('Divorced spouse’s information'),
    fullName: {
      ...fullNameNoSuffixWithAsciiUI(title => `Former spouse’s ${title}`),
    },
    birthDate: currentOrPastDateUI({
      title: 'Former spouse’s date of birth',
      dataDogHidden: true,
      required: () => true,
    }),
    'view:cancelDivorce': {
      'ui:description': (
        <CancelButton dependentType="divorced spouse" isAddChapter={false} />
      ),
    },
  },
};
