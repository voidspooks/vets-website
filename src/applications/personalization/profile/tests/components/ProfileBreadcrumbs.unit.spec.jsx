import React from 'react';
import { expect } from 'chai';
import { MemoryRouter } from 'react-router-dom';
import { renderInReduxProvider } from '~/platform/testing/unit/react-testing-library-helpers';
import { ProfileBreadcrumbs } from '../../components/ProfileBreadcrumbs';
import { PROFILE_PATHS } from '../../constants';
import { getRoutesForNav } from '../../routesForNav';

const setup = path => {
  const routes = getRoutesForNav();
  const view = renderInReduxProvider(
    <MemoryRouter initialEntries={[path]}>
      <ProfileBreadcrumbs routes={routes} />
    </MemoryRouter>,
    {
      initialState: {
        featureToggles: {
          loading: false,
        },
      },
    },
  );

  const breadcrumbList = JSON.parse(
    view.getByTestId('profile-breadcrumbs-wrapper').dataset.breadcrumbsJson,
  );

  return { breadcrumbList };
};

describe('<ProfileBreadcrumbs />', () => {
  it('should render "VA.gov home" and "Profile" as base breadcrumbs', () => {
    const { breadcrumbList } = setup(PROFILE_PATHS.PROFILE_ROOT);

    expect(breadcrumbList[0].label).to.equal('VA.gov home');
    expect(breadcrumbList[1].label).to.equal('Profile');
  });

  describe('should support tier 2 pages', () => {
    it('renders personal information breadcrumb', () => {
      const { breadcrumbList } = setup(PROFILE_PATHS.PERSONAL_INFORMATION);

      expect(breadcrumbList[0].label).to.equal('VA.gov home');
      expect(breadcrumbList[1].label).to.equal('Profile');
      expect(breadcrumbList[2].label).to.equal('Personal information');
    });

    it('renders financial information breadcrumb', () => {
      const { breadcrumbList } = setup(PROFILE_PATHS.FINANCIAL_INFORMATION);

      expect(breadcrumbList[0].label).to.equal('VA.gov home');
      expect(breadcrumbList[1].label).to.equal('Profile');
      expect(breadcrumbList[2].label).to.equal('Financial information');
    });

    it('renders direct deposit breadcrumb', () => {
      const { breadcrumbList } = setup(PROFILE_PATHS.DIRECT_DEPOSIT);

      expect(breadcrumbList[0].label).to.equal('VA.gov home');
      expect(breadcrumbList[1].label).to.equal('Profile');
      expect(breadcrumbList[2].label).to.equal('Financial information');
      expect(breadcrumbList[3].label).to.equal('Direct deposit information');
    });
  });
});
