import { Side, GrenadeType, ViewType } from "./grenades";

export interface SideFilter {
  key: Side | "any";
  label: string;
  icon: string;
}

export interface GrenadeTypeFilter {
  key: GrenadeType | "any";
  label: string;
}

export interface ViewFilter {
  key: ViewType;
  label: string;
}
