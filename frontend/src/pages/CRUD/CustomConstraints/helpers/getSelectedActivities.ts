import axios from 'axios';

const getSelectedActivities = async () => {
  try {
    const res = await axios.get('/users/autocomplete/Activity');
    const resData: any[] = res.data;
    let selectedActivities: any[] = [];

    resData?.forEach((data: any) => {
      selectedActivities = [...selectedActivities, data];
    });

    return selectedActivities.map((a: any) => ({
      label: a?.label,
      value: a?.id,
    }));
  } catch (error) {
    console.log('Err', error);
    return {
      activity: [],
    };
  }
};

export default getSelectedActivities;
