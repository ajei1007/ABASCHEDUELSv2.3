export interface IApiIntegrationResourceItem {
  id: string;
  integratingSoftware: string;
  resourceType: 'employee' | 'client' | 'location' | 'activity' | 'funder';
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}
