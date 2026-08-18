export const resourceLabelClassNames = (arg: any) =>
  arg.resource?.extendedProps?.hidden
    ? ['resource-block', 'fc-resource-hidden']
    : ['resource-block'];

export const resourceClassNames = (arg: any) =>
  arg.resource?.extendedProps?.hidden ? ['fc-resource-hidden'] : [];

export const resourceLaneClassNames = (arg: any) =>
  arg.resource?.extendedProps?.hidden ? ['fc-resource-hidden'] : [];
