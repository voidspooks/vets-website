export const mockData = {
  data: {
    subject: 'Subject',
    question: 'Question',
    phoneNumber: '345-345-3455',
    emailAddress: 'person.name@testmail.com',
    pronouns: {},
    aboutYourself: {
      first: 'test',
      last: 'test',
      socialOrServiceNum: {
        ssn: '444434343',
      },
      dateOfBirth: '1999-01-03',
    },
    relationshipToVeteran: "I'm a family member of a Veteran",
    moreAboutYourRelationshipToVeteran: "I'm the Veteran's spouse",
    onBaseOutsideUS: false,
    address: {
      militaryAddress: {},
    },
    aboutTheVeteran: {
      first: 'John',
      middle: 'Q',
      last: 'Veteran',
      socialOrServiceNum: {
        ssn: '123456780',
      },
      isVeteranDeceased: false,
      dateOfBirth: '1970-01-15',
      branchOfService: 'Army',
    },
    aboutTheFamilyMember: {
      socialOrServiceNum: {},
    },
    stateOrResidency: {
      schoolState: 'GU',
      residencyState: 'GU',
    },
    categoryId: '75524deb-d864-eb11-bb24-000d3a579c45',
    selectCategory: 'Education benefits and work study',
    allowAttachments: true,
    selectTopic: 'Certificate of Eligibility (COE) or Statement of Benefits',
    topicId: '5716ab8e-8276-ef11-a671-001dd8097cca',
    whoIsYourQuestionAbout: 'Myself',
  },
  askVA: {
    categoryID: '75524deb-d864-eb11-bb24-000d3a579c45',
    topicID: '5716ab8e-8276-ef11-a671-001dd8097cca',
    subtopicID: '',
    updatedInReview: '',
    searchLocationInput: '',
    getLocationInProgress: false,
    currentUserLocation: [],
    getLocationError: false,
    selectedFacility: null,
    vaHealthFacility: '',
    reviewPageView: {
      openChapters: [],
    },
  },
  chapters: [
    {
      expandedPages: [
        {
          path: 'category-topic-1',
          title: 'Category',
          CustomPage: {
            compare: null,
          },
          editModeOnReviewPage: false,
          schema: {
            type: 'object',
            properties: {},
          },
          uiSchema: {},
          pageKey: 'selectCategory',
          chapterKey: 'categoryTopics',
        },
        {
          path: 'category-topic-2',
          title: 'Topic',
          CustomPage: {
            compare: null,
          },
          editModeOnReviewPage: false,
          schema: {
            type: 'object',
            properties: {},
          },
          uiSchema: {},
          pageKey: 'selectTopic',
          chapterKey: 'categoryTopics',
        },
      ],
      formConfig: {
        pages: {
          selectCategory: {
            path: 'category-topic-1',
            title: 'Category',
            CustomPage: {
              compare: null,
            },
            editModeOnReviewPage: false,
            schema: {
              type: 'object',
              properties: {},
            },
            uiSchema: {},
            pageKey: 'selectCategory',
            chapterKey: 'categoryTopics',
          },
          selectTopic: {
            path: 'category-topic-2',
            title: 'Topic',
            CustomPage: {
              compare: null,
            },
            editModeOnReviewPage: false,
            schema: {
              type: 'object',
              properties: {},
            },
            uiSchema: {},
            pageKey: 'selectTopic',
            chapterKey: 'categoryTopics',
          },
          selectSubtopic: {
            path: 'category-topic-3',
            title: 'Subtopic',
            CustomPage: {
              compare: null,
            },
            editModeOnReviewPage: false,
            schema: {
              type: 'object',
              properties: {},
            },
            uiSchema: {},
            pageKey: 'selectSubtopic',
            chapterKey: 'categoryTopics',
          },
          whoIsYourQuestionAbout: {
            editModeOnReviewPage: false,
            path: 'who-is-your-question-about',
            title: 'Who is your question about?',
            CustomPage: {
              compare: null,
            },
            schema: {
              type: 'object',
              properties: {},
            },
            uiSchema: {},
            pageKey: 'whoIsYourQuestionAbout',
            chapterKey: 'categoryTopics',
          },
        },
        expandedPages: [
          {
            path: 'category-topic-1',
            title: 'Category',
            CustomPage: {
              compare: null,
            },
            editModeOnReviewPage: false,
            schema: {
              type: 'object',
              properties: {},
            },
            uiSchema: {},
            pageKey: 'selectCategory',
            chapterKey: 'categoryTopics',
          },
          {
            path: 'category-topic-2',
            title: 'Topic',
            CustomPage: {
              compare: null,
            },
            editModeOnReviewPage: false,
            schema: {
              type: 'object',
              properties: {},
            },
            uiSchema: {},
            pageKey: 'selectTopic',
            chapterKey: 'categoryTopics',
          },
          {
            path: 'category-topic-3',
            title: 'Subtopic',
            CustomPage: {
              compare: null,
            },
            editModeOnReviewPage: false,
            schema: {
              type: 'object',
              properties: {},
            },
            uiSchema: {},
            pageKey: 'selectSubtopic',
            chapterKey: 'categoryTopics',
          },
          {
            editModeOnReviewPage: false,
            path: 'who-is-your-question-about',
            title: 'Who is your question about?',
            CustomPage: {
              compare: null,
            },
            schema: {
              type: 'object',
              properties: {},
            },
            uiSchema: {},
            pageKey: 'whoIsYourQuestionAbout',
            chapterKey: 'categoryTopics',
          },
        ],
      },
      name: 'categoryTopics',
      open: false,
      pageKeys: ['selectCategory', 'selectTopic'],
      hasUnviewedPages: true,
    },
    {
      expandedPages: [
        {
          path: 'your-question',
          title: 'Your question',
          uiSchema: {
            'ui:description': {
              type: 'h3',
              key: null,
              ref: null,
              props: {
                children: 'Your question',
              },
              _owner: null,
              _store: {},
            },
            'ui:objectViewField': {
              compare: null,
            },
            subject: {
              'ui:title': 'Subject',
              'ui:options': {},
            },
            question: {
              'ui:title': "What's your question?",
              'ui:errorMessages': {
                required: 'Let us know what your question is about.',
              },
              'ui:options': {
                required: true,
                useFormsPattern: 'single',
              },
            },
            fileUpload: {
              'ui:title': 'Select optional files to upload',
              'ui:options': {},
            },
          },
          schema: {
            type: 'object',
            required: [],
            properties: {
              subject: {
                type: 'string',
              },
              question: {
                type: 'string',
              },
              fileUpload: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    fileName: {
                      type: 'string',
                    },
                    fileSize: {
                      type: 'integer',
                    },
                    fileType: {
                      type: 'string',
                    },
                    base64: {
                      type: 'string',
                    },
                    fileID: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          pageKey: 'question',
          chapterKey: 'yourQuestion',
        },
      ],
      formConfig: {
        pages: {
          question: {
            path: 'your-question',
            title: 'Your question',
            uiSchema: {
              'ui:description': {
                type: 'h3',
                key: null,
                ref: null,
                props: {
                  children: 'Your question',
                },
                _owner: null,
                _store: {},
              },
              'ui:objectViewField': {
                compare: null,
              },
              subject: {
                'ui:title': 'Subject',
                'ui:options': {},
              },
              question: {
                'ui:title': "What's your question?",
                'ui:errorMessages': {
                  required: 'Let us know what your question is about.',
                },
                'ui:options': {
                  required: true,
                  useFormsPattern: 'single',
                },
              },
              fileUpload: {
                'ui:title': 'Select optional files to upload',
                'ui:options': {},
              },
            },
            schema: {
              type: 'object',
              required: [],
              properties: {
                subject: {
                  type: 'string',
                },
                question: {
                  type: 'string',
                },
                fileUpload: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      fileName: {
                        type: 'string',
                      },
                      fileSize: {
                        type: 'integer',
                      },
                      fileType: {
                        type: 'string',
                      },
                      base64: {
                        type: 'string',
                      },
                      fileID: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
            pageKey: 'question',
            chapterKey: 'yourQuestion',
          },
        },
        expandedPages: [
          {
            path: 'your-question',
            title: 'Your question',
            uiSchema: {
              'ui:description': {
                type: 'h3',
                key: null,
                ref: null,
                props: {
                  children: 'Your question',
                },
                _owner: null,
                _store: {},
              },
              'ui:objectViewField': {
                compare: null,
              },
              subject: {
                'ui:title': 'Subject',
                'ui:options': {},
              },
              question: {
                'ui:title': "What's your question?",
                'ui:errorMessages': {
                  required: 'Let us know what your question is about.',
                },
                'ui:options': {
                  required: true,
                  useFormsPattern: 'single',
                },
              },
              fileUpload: {
                'ui:title': 'Select optional files to upload',
                'ui:options': {},
              },
            },
            schema: {
              type: 'object',
              required: [],
              properties: {
                subject: {
                  type: 'string',
                },
                question: {
                  type: 'string',
                },
                fileUpload: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      fileName: {
                        type: 'string',
                      },
                      fileSize: {
                        type: 'integer',
                      },
                      fileType: {
                        type: 'string',
                      },
                      base64: {
                        type: 'string',
                      },
                      fileID: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
            pageKey: 'question',
            chapterKey: 'yourQuestion',
          },
        ],
      },
      name: 'yourQuestion',
      open: false,
      pageKeys: ['question'],
      hasUnviewedPages: true,
    },
    {
      expandedPages: [
        {
          path: 'your-contact-information',
          title: 'Your contact information',
          uiSchema: {},
          schema: {
            type: 'object',
            properties: {},
          },
          pageKey: 'contactInformation',
          chapterKey: 'yourContactInformation',
          editModeOnReviewPage: false,
        },
      ],
      formConfig: {
        pages: {
          contactInformation: {
            path: 'your-contact-information',
            title: 'Your contact information',
            uiSchema: {},
            schema: {
              type: 'object',
              properties: {},
            },
            pageKey: 'contactInformation',
            chapterKey: 'yourContactInformation',
            editModeOnReviewPage: false,
          },
        },
      },
      name: 'yourContactInformation',
      open: false,
      pageKeys: ['contactInformation'],
      hasUnviewedPages: true,
    },
    {
      expandedPages: [
        {
          path: 'about-the-veteran',
          title: "Veteran's personal information",
          uiSchema: {},
          schema: {
            type: 'object',
            properties: {},
          },
          pageKey: 'aboutTheVeteran_aboutmyselfrelationshipfamilymember',
          chapterKey: 'veteransPersonalInformation',
          editModeOnReviewPage: false,
        },
      ],
      formConfig: {
        pages: {
          // eslint-disable-next-line camelcase
          aboutTheVeteran_aboutmyselfrelationshipfamilymember: {
            path: 'about-the-veteran',
            title: "Veteran's personal information",
            uiSchema: {},
            schema: {
              type: 'object',
              properties: {},
            },
            pageKey: 'aboutTheVeteran_aboutmyselfrelationshipfamilymember',
            chapterKey: 'veteransPersonalInformation',
            editModeOnReviewPage: false,
          },
        },
      },
      name: 'veteransPersonalInformation',
      open: false,
      pageKeys: ['aboutTheVeteran_aboutmyselfrelationshipfamilymember'],
      hasUnviewedPages: true,
    },
  ],
  user: {
    login: {
      currentlyLoggedIn: true,
      hasCheckedKeepAlive: false,
    },
    profile: {
      accountUuid: 'e7a9d766-8f42-4096-9ee2-b034cefc47ad',
      loa: {
        current: 3,
        highest: 3,
      },
    },
  },
};
