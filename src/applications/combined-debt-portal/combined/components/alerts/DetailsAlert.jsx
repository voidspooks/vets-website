import React from 'react';
import CardLinks from '../common/CardLinks';
import PhoneNumbers from '../common/PhoneNumbers';
import { useStatusContent } from '../../hooks/useStatusContent';
import { commonPropTypes } from '../common/prop-types/CommonPropTypes';
import BaseAlert from './BaseAlert';

const DetailsAlert = ({ type, data }) => {
  const {
    transformedData,
    headerKey,
    headerValues,
    bodyKey,
    bodyValues,
    alertStatus,
    linkIds,
    phoneSet,
  } = useStatusContent(type, data, 'details');

  return (
    <BaseAlert
      class="vads-u-margin-bottom--1"
      disable-analytics="false"
      status={alertStatus}
      data-testid={`details-alert-${transformedData.id}`}
      full-width="false"
      visible="true"
      headerKey={headerKey}
      headerValues={headerValues}
      bodyKey={bodyKey}
      bodyValues={bodyValues}
    >
      <PhoneNumbers phoneSet={phoneSet} />
      <CardLinks
        links={linkIds}
        data={data}
        type={type}
        transformed={transformedData}
        view="details"
      />
    </BaseAlert>
  );
};

DetailsAlert.propTypes = {
  data: commonPropTypes.data,
  type: commonPropTypes.type,
};

export default DetailsAlert;
