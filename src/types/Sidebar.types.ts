import { ReactNode } from "react";

export type SidebarItem = {
  icon: ReactNode;
  title: string;
  submenuItems?: SubmenuItem[];
};

export type SubmenuItem = {
    label: string;
    onClick?: () => void;
  };