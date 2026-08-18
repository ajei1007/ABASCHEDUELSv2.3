import Loader from 'components/Loader/Loader';
import TextViewItem from 'components/FormItems/items/TextViewItem';
import Widget from 'components/Widget/Widget';

type BranchesWidgetProps = {
  record: {
    [rest: string]: any
};
loading?: boolean
}

const BranchesWidget = ({record, loading}: BranchesWidgetProps) => {
  const renderView = () => (
    <Widget className="widget-p-md" title={<h4>{'View User'}</h4>} >
      <TextViewItem
        label={'Name'}
        value={record.name}
      />
    </Widget>
  );

  if (loading || !record) {
    return <Loader />;
  }

  return renderView();
}

export default BranchesWidget;
