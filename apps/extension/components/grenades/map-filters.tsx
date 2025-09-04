import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Search } from "lucide-react";
import { useI18n } from "../../hooks/use-i18n";
import {
  SideFilter,
  GrenadeTypeFilter,
  ViewFilter,
  Side,
  GrenadeType,
  ViewType,
} from "@/types";

interface MapFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewFilter: ViewType;
  onViewFilterChange: (view: ViewType) => void;
  sideFilter: Side | "any";
  onSideFilterChange: (side: Side | "any") => void;
  grenadeTypeFilter: GrenadeType | "any";
  onGrenadeTypeFilterChange: (type: GrenadeType | "any") => void;
  hasInteractiveMapData: boolean;
}

export function MapFilters({
  searchQuery,
  onSearchChange,
  viewFilter,
  onViewFilterChange,
  sideFilter,
  onSideFilterChange,
  grenadeTypeFilter,
  onGrenadeTypeFilterChange,
  hasInteractiveMapData,
}: MapFiltersProps) {
  const { t } = useI18n();

  const sideFilters: SideFilter[] = [
    {
      key: "t",
      label: t("t"),
      icon: "https://media.kage.gg/images/t.png",
    },
    {
      key: "ct",
      label: t("ct"),
      icon: "https://media.kage.gg/images/ct.png",
    },
    {
      key: "any",
      label: t("any"),
      icon: "https://media.kage.gg/images/any.png",
    },
  ];

  const grenadeTypeFilters: GrenadeTypeFilter[] = [
    {
      key: "smokes",
      label: t("smokes"),
    },
    {
      key: "molotovs",
      label: t("molotovs"),
    },
    {
      key: "flashbangs",
      label: t("flashbangs"),
    },
    {
      key: "he",
      label: t("heGrenades"),
    },
    {
      key: "any",
      label: t("any"),
    },
  ];

  const viewFilters: ViewFilter[] = [
    {
      key: "list",
      label: t("list"),
    },
    {
      key: "interactive_map",
      label: t("interactive_map"),
    },
    {
      key: "instant",
      label: t("instant"),
    },
  ];

  return (
    <ScrollArea className="min-h-[60vh] flex-1 rounded-md border p-4 w-1/4">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder={t("searchGrenades")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            {t("view")}
          </label>
          <div className="flex flex-col gap-3">
            {viewFilters.map((view) => (
              <Button
                key={view.key}
                variant="outline"
                size="sm"
                onClick={() => onViewFilterChange(view.key)}
                disabled={
                  (view.key === "interactive_map" && !hasInteractiveMapData) ||
                  view.key === "instant"
                }
                className={`flex items-center gap-2 ${
                  viewFilter === view.key
                    ? "bg-orange-custom hover:bg-orange-custom-hover text-orange-custom-text hover:text-orange-custom-text-hover active:text-orange-custom-text-active active:bg-orange-custom border-orange-custom hover:border-orange-custom-hover active:border-orange-custom-active hover:cursor-pointer"
                    : "hover:bg-orange-custom-hover hover:text-orange-custom-text-hover hover:cursor-pointer"
                } ${
                  (view.key === "interactive_map" && !hasInteractiveMapData) ||
                  view.key === "instant"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {view.label}
                {view.key === "interactive_map" && !hasInteractiveMapData && (
                  <span className="text-xs text-muted-foreground">
                    ({t("soon")})
                  </span>
                )}
                {view.key === "instant" && (
                  <span className="text-xs text-muted-foreground">
                    ({t("soon")})
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            {t("side")}
          </label>
          <div className="flex flex-col gap-3">
            {sideFilters.map((side) => (
              <Button
                key={side.key}
                variant="outline"
                size="sm"
                onClick={() => onSideFilterChange(side.key)}
                className={`flex items-center gap-2 ${
                  sideFilter === side.key
                    ? "bg-orange-custom hover:bg-orange-custom-hover text-orange-custom-text hover:text-orange-custom-text-hover active:text-orange-custom-text-active active:bg-orange-custom border-orange-custom hover:border-orange-custom-hover active:border-orange-custom-active hover:cursor-pointer"
                    : "hover:bg-orange-custom-hover hover:text-orange-custom-text-hover hover:cursor-pointer"
                }`}
              >
                <img src={side.icon} alt={side.label} className="w-5 h-5" />
                {side.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            {t("grenadeType")}
          </label>
          <div className="flex flex-col gap-3">
            {grenadeTypeFilters.map((grenadeType) => (
              <Button
                key={grenadeType.key}
                variant="outline"
                size="sm"
                onClick={() => onGrenadeTypeFilterChange(grenadeType.key)}
                className={`flex items-center gap-2 ${
                  grenadeTypeFilter === grenadeType.key
                    ? "bg-orange-custom hover:bg-orange-custom-hover text-orange-custom-text hover:text-orange-custom-text-hover active:text-orange-custom-text-active active:bg-orange-custom border-orange-custom hover:border-orange-custom-hover active:border-orange-custom-active hover:cursor-pointer"
                    : "hover:bg-orange-custom-hover hover:text-orange-custom-text-hover hover:cursor-pointer"
                }`}
              >
                {grenadeType.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
