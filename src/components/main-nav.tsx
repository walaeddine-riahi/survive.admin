"use client";

import Link from "next/link";
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
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Icon className="h-4 w-4" />
            <span>{item.title}</span>
          </SidebarMenuButton>
          <SidebarMenuSub>
            {item.children.map((child) => {
              const childActive = isActive(child.href);
              const ChildIcon = child.icon;
              return (
                <SidebarMenuSubItem key={child.href}>
                  <Link href={child.href} passHref legacyBehavior>
                    <SidebarMenuSubButton
                      isActive={childActive}
                      className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Icon className="h-4 w-4" />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    );
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="border-b px-6 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-muted-foreground"
          >
            Your Logo
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>{navigation.map(renderMenuItem)}</SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
