import { useConfig } from "@/context/config-provider";
import { useTheme } from "@/context/theme-provider";
import { cn } from "@/lib/utils";
import { ReactElement, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ArrowLeft, MoonStars, Sun } from "@phosphor-icons/react";

export interface SidebarTabItem {
  key: string;
  icon: ReactElement;
  name: string;
  content: ReactElement;
}

interface SidebarTabProps {
  tabs: SidebarTabItem[];
}

export default function SidebarTab({ tabs }: Readonly<SidebarTabProps>) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { theme, toggleTheme, disableToggle } = useTheme();
  const [loadedIndex, setLoadedIndex] = useState(() => {
    const a: boolean[] = new Array(tabs.length).fill(false);
    a[0] = true;
    return a;
  });

  const config = useConfig();

  return (
    <div className={cn("flex h-full bg-neutral-50 dark:bg-neutral-950")}>
      <div className={cn("shrink-0")}>
        <div className="flex flex-col border-r border-neutral-200 dark:border-neutral-800 h-full p-3 gap-4">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger>
              <div className="h-8 w-8 ml-1 mb-2 flex justify-center items-center">
                <svg
                  fill="currentColor"
                  viewBox="75 75 350 350"
                  className="cursor-pointer text-black dark:text-white h-10 w-10"
                >
                  <path d="M249.51,146.58c-58.7,0-106.45,49.37-106.45,110.04c0,60.68,47.76,110.04,106.45,110.04 c58.7,0,106.46-49.37,106.46-110.04C355.97,195.95,308.21,146.58,249.51,146.58z M289.08,332.41l-0.02,0.04l-0.51,0.65 c-5.55,7.06-12.37,9.35-17.11,10.02c-1.23,0.17-2.5,0.26-3.78,0.26c-12.94,0-25.96-9.09-37.67-26.29 c-9.56-14.05-17.84-32.77-23.32-52.71c-9.78-35.61-8.67-68.08,2.83-82.74c5.56-7.07,12.37-9.35,17.11-10.02 c13.46-1.88,27.16,6.2,39.64,23.41c10.29,14.19,19.22,33.83,25.12,55.32C301,285.35,300.08,317.46,289.08,332.41z"></path>
                </svg>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              <div
                className="w-[250px] h-[120px] mb-2 rounded flex flex-col justify-end m-1"
                style={{
                  background: "url(/outerbase-banner.jpg)",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              >
                <div
                  className="p-1 text-white px-2"
                  style={{ background: "#000C" }}
                >
                  <div className="font-bold">Outerbase Studio</div>
                  <div className="text-xs -mt-0.5">
                    v{process.env.NEXT_PUBLIC_STUDIO_VERSION}
                  </div>
                </div>
              </div>

              {config.sideBarFooterComponent}

              {!disableToggle && (
                <DropdownMenuItem
                  onClick={() => {
                    toggleTheme();
                  }}
                >
                  {theme === "dark" ? (
                    <Sun className="mr-2" />
                  ) : (
                    <MoonStars className="mr-2" />
                  )}
                  Switch to {theme === "dark" ? "light mode" : "dark mode"}
                </DropdownMenuItem>
              )}
              {config.onBack && (
                <DropdownMenuItem onClick={config.onBack}>
                  <ArrowLeft className="mr-2" />
                  Back to bases
                </DropdownMenuItem>
              )}
              {config.onBack && !disableToggle && <DropdownMenuSeparator />}
              <DropdownMenuItem inset>
                <Link
                  className="block w-full"
                  href="https://github.com/outerbase/studio/issues"
                  target="_blank"
                >
                  Report issues
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem inset>
                <Link
                  className="block w-full"
                  href="https://www.outerbase.com/about/"
                  target="_blank"
                >
                  About us
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {tabs.map(({ key, name, icon }, idx) => {
            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <button
                    title={name}
                    onClick={() => {
                      if (!loadedIndex[idx]) {
                        loadedIndex[idx] = true;
                        setLoadedIndex([...loadedIndex]);
                      }

                      if (idx !== selectedIndex) {
                        setSelectedIndex(idx);
                      }
                    }}
                    className={cn(
                      "cursor cursor-pointer h-10 w-10 flex flex-col gap-0.5 justify-center items-center hover:text-neutral-900 dark:hover:text-neutral-100 text-neutral-400 dark:text-neutral-600",
                      selectedIndex === idx
                        ? "bg-neutral-200 dark:bg-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100"
                        : undefined
                    )}
                  >
                    {icon}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{name}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>

      <div className="relative flex h-full grow overflow-hidden">
        {tabs.map((tab, tabIndex) => {
          const selected = selectedIndex === tabIndex;

          return (
            <div
              key={tab.key}
              style={{
                contentVisibility: selected ? "auto" : "hidden",
                zIndex: selected ? 0 : -1,
                position: "absolute",
                display: "flex",
                left: 0,
                right: 0,
                bottom: 0,
                top: 0,
              }}
            >
              {loadedIndex[tabIndex] && tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}