import React from 'react';
import Loader from 'components/Loader/Loader';
import TextViewItem from 'components/FormItems/items/TextViewItem';
import Widget from 'components/Widget/Widget';

type EventsWidgetProps = {
  record: {
    [rest: string]: any
};
loading?: boolean
}

const EventsWidget = ({record, loading}: EventsWidgetProps) => {

  const renderView = () => (
    <Widget className="widget-p-md" title={<h4>{'View Event'}</h4>} >
      <TextViewItem
        label={'Users'}
        value={record.users.map((e: { firstName: any; })=>e.firstName).join(' - ')}
      />

<TextViewItem
        label={'Start'}
        value={record.start}
      />

<TextViewItem
        label={'End'}
        value={record.end}
      />

      <TextViewItem
        label={'Start Recur'}
        value={record.startRecur}
      />
      <TextViewItem
        label={'End Recur'}
        value={record.endRecur}
      />
      {false && Object.entries(record).map(e => {
      const [key,value] = e
      return (<TextViewItem
        label={key}
        value={value}
      />)
      }
      )
    }

      
    </Widget>
  );

  if (loading || !record) {
    return <Loader />;
  }

  return renderView();
}

export default EventsWidget;
