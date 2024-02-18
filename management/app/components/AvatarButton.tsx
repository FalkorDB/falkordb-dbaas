'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signIn, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";

// A function that takes a full name as a string and returns its initials as a string
function getInitials(fullName: string): string {
  // Split the full name by spaces and store the parts in an array
  const nameParts = fullName.split(" ");
  // Initialize an empty string to store the initials
  let initials = "";
  // Use array iteration method to loop through the name parts array
  nameParts.forEach((part) => {
    // If the part is not empty, append its first character (uppercased) to the initials string
    if (part) {
      initials += part[0].toUpperCase();
    }
  });
  // Return the initials string
  return initials;
}


export default function AvatarButton({collapsed} : {collapsed: boolean}) {
  const { data: session, status } = useSession()

  if (status === "unauthenticated") {
    return (
      <Button onClick={() => signIn(undefined, { callbackUrl: '/sandbox' })}
        className="h-12 rounded-lg font-bold px-5 text-slate-50">
        Sign in
      </Button>
    )
  }

  const name = session?.user?.name;
  // const email = session?.user?.email;
  const image = session?.user?.image ?? ""
  const initials = name ? getInitials(name) : ""
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <HoverCard>
          <HoverCardTrigger>
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage alt="@shadcn" src={image} />
                <AvatarFallback className="text-blue-600">{initials}</AvatarFallback>
              </Avatar>
              {!collapsed && <div className="text-xs font-bold text-slate-50">{name}</div>}
            </div>
          </HoverCardTrigger>
          {/* <HoverCardContent className="w-80">
            <div className="flex flex-col text-left text-black">
              <div>Name: {name}</div>
              <div>Email: {email}</div>
            </div>
          </HoverCardContent> */}
        </HoverCard>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem> */}
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

