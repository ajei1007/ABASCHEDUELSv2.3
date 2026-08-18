const generateDescriptionForCapacityConstraints = (formValues: any, record: any = {}): string => {
  const mergedValues = { ...record, ...formValues }; // Merge record and form values

  const {
    user1,
    role1, role2, role3, role4, role5, 
    tag1, tag2, tag3, tag4, tag5,
    min1, max1, min2, max2, min3, max3, min4, max4, min5, max5,
    locationDisabled, priority, disabled
  } = mergedValues;

  let description = "This constraint applies ";
  
  // Add activity
  const activityName = user1?.firstName || user1?.name || user1?.label; 
    if (user1) {
    description += `to the activity: <strong>${activityName}</strong> `;
  }

  // Collect roles
  const roles = [role1, role2, role3, role4, role5].filter(Boolean).map(role => role?.name || role?.label);
  if (roles.length > 0) {
    description += roles.length > 1 ? `with roles: <strong>${roles.join(', ')}</strong> ` : `with the role: <strong>${roles[0]}</strong> `;
  }
  
  // Collect tags
  const tags = [tag1, tag2, tag3, tag4, tag5].filter(Boolean).map(tag => tag?.name || tag?.label);
  if (tags.length > 0) {
    description += tags.length > 1 ? `with tags: <strong>${tags.join(', ')}</strong> ` : `with the tag: <strong>${tags[0]}</strong> `;
  }
  
  
  // Process constraints (min/max per role)
  const constraints = [
    { min: min1, max: max1 },
    { min: min2, max: max2 },
    { min: min3, max: max3 },
    { min: min4, max: max4 },
    { min: min5, max: max5 },
  ].filter(({ min, max }) => min || max); // Only include defined constraints

  if (constraints.length > 0) {
    description += `and must meet the following constraints: `;
    constraints.forEach(({ min, max }) => {
      description += `<strong>minimum roles: ${min}, maximum roles: ${max}</strong>. `;
    });
  }

  if (locationDisabled) {
    description += "This constraint does not apply to specific locations. ";
  }

  if (priority) {
    description += `The priority level is set to <strong>${priority}</strong>. `;
  }
  
  if (disabled) { 
    description += `This constraint is <strong>disabled</strong>.`;
  }

  return description.trim();
};

export default generateDescriptionForCapacityConstraints;
