import React, { useEffect, useState } from 'react';

const PrivateRecordsDeletedAlert = () => {
  const [showModal, setShowModal] = useState(() => {});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setShowModal(params.get('removedAllWarn') === 'true');
  }, []);

  return (
    <va-alert status="info" visible={showModal}>
      <h2>Don’t need us to request your records?</h2>
      <p>
        Use the Back button 4 times. Then select "No" when asked if you want us
        to request your private provider or VA Vet Center records.
      </p>
    </va-alert>
  );
};

export default PrivateRecordsDeletedAlert;
