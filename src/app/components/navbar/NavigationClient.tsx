"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { AvatarIcon } from "~/app/components/Avatar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";

export function NavBarBase({ profilePic }: { profilePic: string }) {
  return (
    <div className="fixed left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-border/40 bg-background/80 p-4 text-foreground backdrop-blur-xs transition-colors duration-300">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Find Mentors</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <Link
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-linear-to-b from-primary/10 to-primary/5 p-6 no-underline outline-hidden transition-colors hover:bg-primary/10 focus:shadow-md dark:from-primary/20 dark:to-primary/10 dark:hover:bg-primary/20"
                      href="/browse"
                    >
                      <div className="mb-2 mt-4 text-lg font-medium text-foreground">
                        Browse Mentors
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Find college students who match your interests and goals
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <ListItem href="/search/schools" title="Search by School">
                  Find mentors from specific colleges and universities
                </ListItem>
                <ListItem href="/search/majors" title="Search by Major">
                  Connect with students in your intended field of study
                </ListItem>
                <ListItem href="/search/interests" title="Search by Interests">
                  Discover mentors who share your passions
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                <ListItem href="/guides/application" title="Application Guide">
                  Step-by-step guide to college applications
                </ListItem>
                <ListItem href="/guides/essays" title="Essay Writing">
                  Tips for writing compelling college essays
                </ListItem>
                <ListItem href="/guides/interviews" title="Interview Prep">
                  Prepare for college interviews
                </ListItem>
                <ListItem href="/guides/financial-aid" title="Financial Aid">
                  Understanding scholarships and aid options
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>My Account</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                <ListItem href="/dashboard" title="Dashboard">
                  View your mentorship connections and messages
                </ListItem>
                <ListItem href="/meetings" title="My Meetings">
                  Manage your scheduled video meetings
                </ListItem>
                <ListItem href="/profile/edit" title="Edit Profile">
                  Update your profile information
                </ListItem>
                <ListItem href="/settings" title="Settings">
                  Adjust your account preferences
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <AvatarIcon profilePic={profilePic} />
    </div>
  );
}

interface ListItemProps extends React.ComponentPropsWithoutRef<"a"> {
  title: string;
  className?: string;
}

const ListItem = React.forwardRef<React.ElementRef<"a">, ListItemProps>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900",
              className,
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none text-foreground">
              {title}
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  },
);
ListItem.displayName = "ListItem";
