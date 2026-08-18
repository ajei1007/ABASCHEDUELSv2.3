function resourceGroupLabelDidMount(arg: any) {
  const el = arg.el as HTMLSpanElement;
  const resourceType = arg.groupValue?.split('|')?.[0] || '';
  if (!el) {
    return;
  }
  el.setAttribute('data-qa', 'resource-group-label');
  if (resourceType) {
    el.setAttribute('data-resource-group', resourceType);
  }
}

export function useFullcalendarConfigResourceGroupLabelDidMount() {
  return resourceGroupLabelDidMount;
}
