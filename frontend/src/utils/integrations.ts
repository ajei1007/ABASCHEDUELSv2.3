export enum IntegrationTypes {
  RETHINK = 'rethink',
  THERALYTICS = 'theralytics',
  CENTRAL_REACH = 'centralreach',
  MEASURE_PM = 'measurepm',
  THERAPY_PMS = 'therapypms',
}

export const integrations = [
  IntegrationTypes.RETHINK,
  IntegrationTypes.THERALYTICS,
  IntegrationTypes.CENTRAL_REACH,
  IntegrationTypes.MEASURE_PM,
  IntegrationTypes.THERAPY_PMS,
];

export const allowedIntegration = (
  integOrg: IntegrationTypes,
  companyIntegrations: Array<IntegrationTypes>,
) => {
  const formattedCompanyIntegrations = companyIntegrations.filter(
    (str: string) => {
      const foundIntegration = integrations.findIndex((i) => i === str);
      return foundIntegration !== -1;
    },
  );
  return formattedCompanyIntegrations.includes(integOrg);
};
