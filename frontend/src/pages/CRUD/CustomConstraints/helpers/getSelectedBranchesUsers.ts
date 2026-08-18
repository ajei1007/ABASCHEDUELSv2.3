import axios from 'axios';

const getSelectedBranchesUsers = async (q='') => {
  try {
    const res = await axios.get(`/users/autocomplete/Resource?query=${q}&limit=100`);
    // params: {
    //     branches: branches.map((branch: any) => branch.id).join('|'),
    //   },
    const resData = res.data;

    // Seperate Locations and Users (Employees, Clients, Activities);
    // let selectedBranchUsers: any = [];
    // let selectedBranchLocations: any = [];
    // resData?.forEach((data: any) => {
    //   if (data.type === 'Location') {
    //     selectedBranchLocations = [...selectedBranchLocations, data];
    //   } else {
    //     selectedBranchUsers = [...selectedBranchUsers, data];
    //   }
    // });

    return resData.map((p: any) => ({
        label: p?.label,
        value: p.id,
      }))
  } catch (error) {
    console.log('Err', error);
  }
};

export default getSelectedBranchesUsers;