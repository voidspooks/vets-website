// @ts-check
import React from 'react';
import { titleUI } from 'platform/forms-system/src/js/web-component-patterns';

export default {
  uiSchema: {
    ...titleUI('What you’ll need to have prepared for your program(s)'),
    'view:programIntro': {
      'ui:description': (
        <div>
          <p>
            To apply for the approval of a program in a foreign country, you
            will need to register at least one program in your application.
          </p>
          <ul>
            <li>The name of the degree program </li>
            <li>The total length of the program</li>
            <li>The number of weeks per term/semester</li>
            <li>Entry requirements, if any, for the program</li>
            <li>Number of credit hours</li>
          </ul>

          <p>
            <strong>Note: </strong>
            If you have medical school programs, you will need the accrediting
            authority name, length of clinical/classroom instruction, and
            graduation details for the last two classes.
          </p>
          <va-alert status="info" visible>
            <h2
              slot="headline"
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex="0"
            >
              Important information about your application
            </h2>
            <p>
              Your institution must submit at least one program for approval.
              We’ll let you know if your program(s) is eligible after we review
              your application package.
            </p>
          </va-alert>
        </div>
      ),
    },
  },
  schema: {
    type: 'object',
    properties: {
      'view:programIntro': { type: 'object', properties: {} },
    },
  },
};
