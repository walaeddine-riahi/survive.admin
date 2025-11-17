"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import * as React from "react";

import { NavigationItem, navigation } from "./navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from "./ui/sidebar";

export function MainNav() {
  const pathname = usePathname();

  const isActive = React.useCallback(
    (href: string) => {
      return pathname === href;
    },
    [pathname]
  );

  const renderMenuItem = (item: NavigationItem) => {
    const active = isActive(item.href);
    const Icon = item.icon;

    if (item.children) {
      return (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            isActive={active}
            className="text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg px-3 py-2"
          >
            <Icon className="h-5 w-5" />
            <span>{item.title}</span>
          </SidebarMenuButton>
          <SidebarMenuSub className="ml-6 mt-1 space-y-1">
            {item.children.map((child) => {
              const childActive = isActive(child.href);
              const ChildIcon = child.icon;
              return (
                <SidebarMenuSubItem key={child.href}>
                  <Link href={child.href} passHref legacyBehavior>
                    <SidebarMenuSubButton
                      isActive={childActive}
                      className="text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-1.5"
                    >
                      <ChildIcon className="h-4 w-4" />
                      <span>{child.title}</span>
                    </SidebarMenuSubButton>
                  </Link>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.href}>
        <Link href={item.href} passHref legacyBehavior>
          <SidebarMenuButton
            isActive={active}
            className="text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg px-3 py-2"
          >
            <Icon className="h-5 w-5" />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    );
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="border-r bg-background">
        <SidebarHeader className="border-b px-4 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 font-bold text-foreground hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.svg"
              alt="SURVIVE Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-lg">SURVIVE.ADMIN</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-3 py-4">
          <SidebarMenu className="space-y-1">
            {navigation.map(renderMenuItem)}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
