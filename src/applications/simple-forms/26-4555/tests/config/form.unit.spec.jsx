import { expect } from 'chai';
import formConfig from '../../config/form';

describe('26-4555 form config', () => {
  describe('conditional page depends functions', () => {
    const { chapters } = formConfig;
    describe('previousSahApplication2 depends', () => {
      const {
        depends,
      } = chapters.previousApplicationsChapter.pages.previousSahApplication2;

      it('should show page when hasPreviousSahApplication is true', () => {
        const formData = {
          previousSahApplication: {
            hasPreviousSahApplication: true,
          },
        };
        expect(depends(formData)).to.be.true;
      });

      it('should hide page when hasPreviousSahApplication is false', () => {
        const formData = {
          previousSahApplication: {
            hasPreviousSahApplication: false,
          },
        };
        expect(depends(formData)).to.be.false;
      });
      it('should handle missing form data gracefully in previousSahApplication2', () => {
        const page =
          formConfig.chapters.previousApplicationsChapter.pages
            .previousSahApplication2;
        expect(() => page.depends(null)).to.not.throw();
        expect(() => page.depends(undefined)).to.not.throw();
        expect(() => page.depends({})).to.not.throw();
      });
    });

    describe('previousShaApplication2 depends', () => {
      const {
        depends,
      } = chapters.previousApplicationsChapter.pages.previousShaApplication2;

      it('should show page when hasPreviousHiApplication is true', () => {
        const formData = {
          previousHiApplication: {
            hasPreviousHiApplication: true,
          },
        };
        expect(depends(formData)).to.be.true;
      });

      it('should hide page when hasPreviousHiApplication is false', () => {
        const formData = {
          previousHiApplication: {
            hasPreviousHiApplication: false,
          },
        };
        expect(depends(formData)).to.be.false;
      });

      it('should handle missing form data gracefully in previousShaApplication2', () => {
        const page =
          chapters.previousApplicationsChapter.pages.previousShaApplication2;
        expect(() => page.depends(null)).to.not.throw();
        expect(() => page.depends(undefined)).to.not.throw();
        expect(() => page.depends({})).to.not.throw();
      });
    });

    describe('livingSituation2 depends', () => {
      const {
        depends,
      } = chapters.livingSituationChapter.pages.livingSituation2;

      it('should show page when isInCareFacility is true', () => {
        const formData = {
          livingSituation: {
            isInCareFacility: true,
          },
        };
        expect(depends(formData)).to.be.true;
      });

      it('should hide page when isInCareFacility is false', () => {
        const formData = {
          livingSituation: {
            isInCareFacility: false,
          },
        };
        expect(depends(formData)).to.be.false;
      });

      it('should handle missing form data gracefully in livingSituation2', () => {
        const page = chapters.livingSituationChapter.pages.livingSituation2;
        expect(() => page.depends(null)).to.not.throw();
        expect(() => page.depends(undefined)).to.not.throw();
        expect(() => page.depends({})).to.not.throw();
      });
    });
  });
});
