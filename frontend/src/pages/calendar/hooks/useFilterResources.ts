import { useCallback } from 'react';
import { intersectArrays } from '../utils/intersectArrays';

export function useFilterResources({
  resources,
  frontendRolesHierarchy,
}: {
  resources: any[];
  frontendRolesHierarchy: Record<string, any>;
}) {
  const filterResources = useCallback(
    (roleFilter: any[] = [], userFilter: any[] = []) => {
      return resources.filter((e: any) => {
        let bol1 = true;
        let bol2 = false;
        if (userFilter.length !== 0) {
          bol1 = userFilter.includes(e.id);
        }
        if (roleFilter.length !== 0) {
          for (let index = 0; index < e.roles.length; index++) {
            const element = e.roles[index];
            if (frontendRolesHierarchy[element]) {
              if (
                intersectArrays(frontendRolesHierarchy[element], roleFilter)
                  .length > 0
              ) {
                bol2 = true;
                break;
              }
            }
          }
        } else {
          bol2 = true;
        }
        return bol1 && bol2;
      });
    },
    [resources, frontendRolesHierarchy],
  );

  return filterResources;
}
