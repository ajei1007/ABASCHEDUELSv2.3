import AvailabilitiesTable from 'pages/CRUD/Availabilities/table/AvailabilitiesTable';
import { useParams } from 'react-router-dom';

const AvailabilitiesTablePage = () => {
  type Params = {
    resources: any;
  };
  let {resources} = useParams<Params>();
  return <AvailabilitiesTable resourceType={resources} />;
}

export default AvailabilitiesTablePage;
