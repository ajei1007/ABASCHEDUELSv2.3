function resourceLabelDidMount(arg: any) {
  const el = arg.el as HTMLSpanElement;
  if (!el) {
    return;
  }

  const resourceTitle = arg?.resource?.title;
  const resourceType = arg?.resource?.extendedProps?.type;

  el.setAttribute('data-qa', 'resource-label');

  if (resourceTitle) {
    el.setAttribute('data-resource-title', resourceTitle);
  }

  const isExpandable = el?.querySelector(
    '.fc-datagrid-expander:not(.fc-datagrid-expander-placeholder)',
  );
  if (isExpandable) {
    el.setAttribute('data-resource-expandable', 'true');
  }

  if (resourceType) {
    el.setAttribute('data-resource-type', resourceType);
  }
}

export function useFullcalendarConfigResourceLabelDidMount() {
  return resourceLabelDidMount;
}
