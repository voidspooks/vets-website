import { expect } from 'chai';
import { serviceLabels } from '../../utils/labels';

describe('pre-need labels', () => {
  describe('serviceLabels', () => {
    it('should export service labels object', () => {
      expect(serviceLabels).to.be.an('object');
    });

    it('should contain common service branches', () => {
      expect(serviceLabels.AF).to.equal('U.S. Air Force');
      expect(serviceLabels.AR).to.equal('U.S. Army');
      expect(serviceLabels.CG).to.equal('U.S. Coast Guard');
      expect(serviceLabels.MC).to.equal('U.S. Marine Corps');
      expect(serviceLabels.NA).to.equal('U.S. Navy');
      expect(serviceLabels.SA).to.equal('U.S. Space Force');
    });

    it('should contain historical service labels', () => {
      expect(serviceLabels.AC).to.equal('U.S. Army Air Corps');
      expect(serviceLabels.AA).to.equal('U.S. Army Air Forces');
      expect(serviceLabels.MM).to.equal('U.S. Merchant Marine');
      expect(serviceLabels.PH).to.equal('U.S. Public Health Service');
    });

    it('should contain reserve and guard labels', () => {
      expect(serviceLabels.XA).to.equal('U.S. Navy Reserve');
      expect(serviceLabels.XR).to.equal('U.S. Army Reserve');
      expect(serviceLabels.XF).to.equal('U.S. Air Force Reserve');
      expect(serviceLabels.XC).to.equal('U.S. Marine Corps Reserve');
      expect(serviceLabels.XG).to.equal('Coast Guard Reserve');
      expect(serviceLabels.AG).to.equal('U.S. Air National Guard');
      expect(serviceLabels.NG).to.equal('U.S. Army National Guard');
    });

    it('should contain civilian and allied service labels', () => {
      expect(serviceLabels.NM).to.equal('Non-Military Civilian');
      expect(serviceLabels.AL).to.equal('Allied Forces');
      expect(serviceLabels.FF).to.equal('Foreign Forces');
    });

    it('should contain WWII-specific labels', () => {
      expect(serviceLabels.CV).to.equal(
        'Civilian, Wake Island Naval Air Station',
      );
      expect(serviceLabels.FP).to.equal('Civilian Ferry Pilot');
      expect(serviceLabels.FT).to.equal('American Volunteers Flying Tigers');
    });

    it('should have valid string values for all keys', () => {
      Object.values(serviceLabels).forEach(value => {
        expect(value).to.be.a('string');
        expect(value.length).to.be.greaterThan(0);
      });
    });

    it('should have all keys as two-letter codes', () => {
      Object.keys(serviceLabels).forEach(key => {
        expect(key.length).to.equal(2);
        expect(key).to.match(/^[A-Z0-9]{2}$/);
      });
    });
  });
});
