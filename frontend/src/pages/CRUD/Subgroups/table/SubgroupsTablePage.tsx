import SubgroupsTable from 'pages/CRUD/Subgroups/table/SubgroupsTable';
import { useParams } from 'react-router-dom';

const SubgroupsTablePage = () => {
  type Params = {
    groups: any;
  };
  let { groups } = useParams<Params>();
  return (
    <div>
      <SubgroupsTable groupType={groups}/>
    </div>
  );
}

export default SubgroupsTablePage;
