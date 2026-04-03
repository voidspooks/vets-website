import React from 'react';
import {
  titleUI,
  fullNameNoSuffixSchema,
  currentOrPastDateUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { CancelButton, fullNameNoSuffixWithAsciiUI } from '../../../helpers';
import { DATE_SCHEMA } from '../../../constants';

export const schema = {
  type: 'object',
  properties: {
    reportDivorce: {
      type: 'object',
      properties: {
        fullName: fullNameNoSuffixSchema,
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
