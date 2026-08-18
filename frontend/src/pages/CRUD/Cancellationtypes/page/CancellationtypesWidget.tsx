import React from 'react';
import Loader from 'components/Loader/Loader';
import TextViewItem from 'components/FormItems/items/TextViewItem';
import Widget from 'components/Widget/Widget';

type CancellationtypesWidgetProps = {
  record: {
    [rest: string]: any
};
loading?: boolean
}

const CancellationtypesWidget = ({record, loading}: CancellationtypesWidgetProps) => {

  const renderView = () => (
    <Widget className="widget-p-md" title={<h4>{'View User'}</h4>} >

      <TextViewItem
        label={'name'}
        value={record.name}
      />

    </Widget>
  );

  if (loading || !record) {
    return <Loader />;
  }

  return renderView();
}

export default CancellationtypesWidget;
