import features, { type companyPlanTypes } from 'features';

const checkCompanyPlanFeature = (companyPlan: companyPlanTypes = 'basic', feature: string): boolean => {
  const allowedFeaturesOfCompany: any = features[companyPlan];
  if (allowedFeaturesOfCompany) {
    return allowedFeaturesOfCompany[feature]
  }
  return false;
};

export default checkCompanyPlanFeature;