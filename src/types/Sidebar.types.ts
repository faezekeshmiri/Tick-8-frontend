import { ReactNode } from "react";

export type SidebarItem = {
  icon: ReactNode;
  title: string;
  submenuItems?: SubmenuItem[];
  onClick?: () => void;
};

export type SubmenuItem = {
    label: string;
    onClick?: () => void;
};

export type SidebarAvatar = {
  name: string;
  imageUrl?: string;
  email?: string;
};
