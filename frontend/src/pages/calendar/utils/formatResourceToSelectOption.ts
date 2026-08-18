export function formatResourceToSelectOption(resource: any) {
  return {
    value: resource.id,
    roles: resource.roles,
    address: resource.address,
    label: resource.title,
    resourceTypeId: resource.resourceTypeId,
    empNotReq: resource.empNotReq,
    clientReq: resource.clientReq,
    locReq: resource.locReq,
    funder: resource.funder,
    type: resource.type,
    color: resource.color,
    supervision: resource.supervision,
    rooms: resource.rooms,
  };
}
