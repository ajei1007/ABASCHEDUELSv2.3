export interface NavigationState {
  sidebarOpened: boolean,
  activeItem: any,
  sidebarStatic: boolean,
};

export enum NavigationActionTypes {
  OPEN_SIDEBAR = "OPEN_SIDEBAR",
  CLOSE_SIDEBAR = "CLOSE_SIDEBAR",
  TOGGLE_SIDEBAR = "TOGGLE_SIDEBAR",
  CHANGE_ACTIVE_SIDEBAR_ITEM = "CHANGE_ACTIVE_SIDEBAR_ITEM",
}

interface OpenSidebar {
  type: NavigationActionTypes.OPEN_SIDEBAR;
}

interface ToggleSidebar {
  type: NavigationActionTypes.TOGGLE_SIDEBAR;
}

interface CloseSidebar {
  type: NavigationActionTypes.CLOSE_SIDEBAR;
}

interface ChangeActiveSidebarItem {
  type: NavigationActionTypes.CHANGE_ACTIVE_SIDEBAR_ITEM;
  payload: any;
}

export type NavigationAction =
  | OpenSidebar
  | CloseSidebar
  | ChangeActiveSidebarItem
  | ToggleSidebar
