function resourceLaneDidMount(arg: any) {
  const el = arg.el as HTMLDivElement;
  if (!el) {
    return;
  }

  el.setAttribute('data-qa', 'resource-row-lane');

  const resourceType = arg?.resource?.extendedProps?.type;
  if (resourceType) {
    el.setAttribute('data-resource-type', resourceType);
  }

  const resourceTitle = arg?.resource?.title || '';
  if (resourceTitle) {
    el.setAttribute('data-resource-title', resourceTitle);
  }
}

export function useFullcalendarConfigResourceLaneDidMount() {
  return resourceLaneDidMount;
}
