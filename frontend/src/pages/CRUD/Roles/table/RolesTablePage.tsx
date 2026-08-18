import RolesTable from 'pages/CRUD/Roles/table/RolesTable';
import { useParams } from 'react-router-dom';

const RolesTablePage = () => {
  type Params = {
    resources: any;
  };
  let { resources } = useParams<Params>();
  return (
    <div>
      <RolesTable resourceType={resources}/>
    </div>
  );
}

export default RolesTablePage;
