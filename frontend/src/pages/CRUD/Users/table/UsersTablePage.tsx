import UsersTable from 'pages/CRUD/Users/table/UsersTable';
import { useParams } from 'react-router-dom';

const UsersTablePage = () => {
  type Params = {
    resources: any;
  };
  let {resources} = useParams<Params>();
  return (
    <div>
      <UsersTable resourceType={resources} />
    </div>
  );
}

export default UsersTablePage;
