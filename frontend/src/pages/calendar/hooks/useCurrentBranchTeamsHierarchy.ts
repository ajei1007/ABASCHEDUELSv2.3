import { useMemo } from 'react';
import { useAppSelector } from 'store/hooks';
import { createBranchChildHierarchyMap } from '../utils/createBranchChildHierarchyMap';

function createTeamsParentHierarchyMap(teamsHierarchy: Record<string, any>) {
  const result: Record<string, Set<string>> = {};
  const teams = Object.values(teamsHierarchy);
  teams.forEach((team) => {
    let parentIds = new Set<string>();
    let parentId = team.id;
    while (parentId) {
      parentIds.add(parentId);
      const _parentId = parentId;
      const parent = teams.find(
        (t) => t.keyid === _parentId && t.id !== _parentId,
      );
      parentId = parent ? parent.id : null;
    }
    result[team.keyid] = parentIds;
  });
  return result;
}

export const useCurrentBranchTeamsHierarchy = () => {
  const storeTeamsHierarchy = useAppSelector(
    (state) => state.calendar.teams_hierarchy,
  );

  const storeCurrentBranches = useAppSelector(
    (state) => state.calendar.current_branches,
  );

  const activeTeamsHierarchy = useMemo(() => {
    const entries = Object.entries(storeTeamsHierarchy);

    const branchChildHierarchyMap = createBranchChildHierarchyMap(
      entries.map(([_, item]) => ({
        id: item.keyid,
        parentId: item.id,
      })),
    );

    const inactiveBranches = entries.reduce((acc, [_, item]) => {
      if (item.inactive) {
        branchChildHierarchyMap[item.keyid].forEach((id) => {
          acc.add(id);
        });
      }
      return acc;
    }, new Set<string>()) as Set<string>;

    return entries.reduce(
      (acc, [key, value]) => {
        if (!inactiveBranches.has(value.keyid)) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, any>,
    );
  }, [storeTeamsHierarchy]);

  const teamsParentHierarchyMap = useMemo(
    () => createTeamsParentHierarchyMap(activeTeamsHierarchy),
    [activeTeamsHierarchy],
  );

  const currentBranchTeamsHierarchy = useMemo(
    () =>
      Object.entries(activeTeamsHierarchy as Record<string, any>).reduce(
        (acc, [key, value]) => {
          if (
            value.keyid in teamsParentHierarchyMap &&
            teamsParentHierarchyMap[value.keyid].has(
              storeCurrentBranches[0]?.value,
            )
          ) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>,
      ),
    [storeCurrentBranches, activeTeamsHierarchy, teamsParentHierarchyMap],
  );

  return {
    currentBranchTeamsHierarchy,
  };
};
