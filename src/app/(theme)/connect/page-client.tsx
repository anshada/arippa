"use client";
import { Button } from "@/components/ui/button";
import ConnectionList from "./connection-list";
import Link from "next/link";
import { LucideMoon, LucideSun } from "lucide-react";
import { User } from "lucia";
import { useTheme } from "@/context/theme-provider";

export default function ConnectBody({ user }: Readonly<{ user: User | null }>) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-screen bg-zinc-50 dark:bg-background">
      <div className="sticky top-0 border-b p-2 bg-background flex">
        <Link className="h-12 w-12 flex justify-center items-center" href="/">
          <svg
            fill="currentColor"
            viewBox="75 75 350 350"
            className="cursor-pointer text-black dark:text-white h-10 w-10"
          >
            <path d="M249.51,146.58c-58.7,0-106.45,49.37-106.45,110.04c0,60.68,47.76,110.04,106.45,110.04 c58.7,0,106.46-49.37,106.46-110.04C355.97,195.95,308.21,146.58,249.51,146.58z M289.08,332.41l-0.02,0.04l-0.51,0.65 c-5.55,7.06-12.37,9.35-17.11,10.02c-1.23,0.17-2.5,0.26-3.78,0.26c-12.94,0-25.96-9.09-37.67-26.29 c-9.56-14.05-17.84-32.77-23.32-52.71c-9.78-35.61-8.67-68.08,2.83-82.74c5.56-7.07,12.37-9.35,17.11-10.02 c13.46-1.88,27.16,6.2,39.64,23.41c10.29,14.19,19.22,33.83,25.12,55.32C301,285.35,300.08,317.46,289.08,332.41z"></path>
          </svg>
        </Link>

        <div className="flex-1" />

        <div className="flex gap-2 items-center mr-2">
          <Button size={"icon"} variant={"ghost"} onClick={() => toggleTheme()}>
            {theme === "dark" ? (
              <LucideMoon className="w-4 h-4" />
            ) : (
              <LucideSun className="w-4 h-4" />
            )}
          </Button>

          {user ? (
            <Link prefetch={false} href="/logout">
              <Button variant={"secondary"}>Sign Out</Button>
            </Link>
          ) : (
            <Link prefetch={false} href="/login">
              <Button variant={"secondary"}>Sign In</Button>
            </Link>
          )}
        </div>
      </div>

      <ConnectionList user={user} />
    </div>
  );
}