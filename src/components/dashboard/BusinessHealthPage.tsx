import React from 'react';
import PageHeader from '../ui/PageHeader';

const BusinessHealthPage: React.FC = () => {
  const onClose = () => {
    // Implement the logic to close the page
  };

  return (
    <div>
      <PageHeader
        title="Business Health"
        onBackClick={onClose}
        compact
      />
    </div>
  );
};

export default BusinessHealthPage; 