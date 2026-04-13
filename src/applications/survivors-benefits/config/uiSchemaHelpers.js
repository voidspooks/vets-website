const addForceDivWrapperToUiSchemaRoot = uiSchemaNode => {
  const uiOptions = uiSchemaNode?.['ui:options'];

  return {
    ...uiSchemaNode,
    'ui:options': {
      ...uiOptions,
      forceDivWrapper: true,
    },
  };
};

const addForceDivWrapperToPages = pages => {
  const clonedPages = {};

  Object.keys(pages).forEach(pageKey => {
    const page = pages[pageKey];
    const uiSchemaWithRootOption = page?.uiSchema
      ? addForceDivWrapperToUiSchemaRoot(page.uiSchema)
      : page?.uiSchema;

    const arrayPathNode =
      page?.arrayPath && uiSchemaWithRootOption?.[page.arrayPath];

    const uiSchema = arrayPathNode
      ? {
          ...uiSchemaWithRootOption,
          [page.arrayPath]: {
            ...arrayPathNode,
            'ui:options': {
              ...arrayPathNode?.['ui:options'],
              forceDivWrapper: true,
            },
            ...(arrayPathNode?.items
              ? {
                  items: addForceDivWrapperToUiSchemaRoot(arrayPathNode.items),
                }
              : {}),
          },
        }
      : uiSchemaWithRootOption;

    clonedPages[pageKey] = {
      ...page,
      uiSchema,
    };
  });

  return clonedPages;
};

export const applyForceDivWrapperToFormConfig = formConfig => {
  const clonedChapters = {};

  Object.keys(formConfig.chapters).forEach(chapterKey => {
    const chapter = formConfig.chapters[chapterKey];

    clonedChapters[chapterKey] = {
      ...chapter,
      pages: addForceDivWrapperToPages(chapter.pages),
    };
  });

  return {
    ...formConfig,
    chapters: clonedChapters,
  };
};

export { addForceDivWrapperToUiSchemaRoot };
