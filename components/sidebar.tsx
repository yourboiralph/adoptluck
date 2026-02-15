"use client"

import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Play,
  PlusCircle,
  MinusCircle,
  History,
  CheckCircle,
  Ellipsis,
  LogOut
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

function getNavigation(username?: string){
    return [
        {name: "Play", href: "/", icon: Play},
        {name: "Deposit", href: "/deposit", icon: PlusCircle},
        {name: "Withdraw", href: "/withdraw", icon: MinusCircle},
        {name: "History", href: "/history", icon: History},
        {name: "Provably Fair", href: "/provably-fair", icon: CheckCircle},
    ]
}

export function Sidebar(){

    const session = authClient.useSession()
    const username = session.data?.user.username ?? ""
    const pathname = usePathname()
    const navigation = getNavigation(username)

    const handleLogout = async () => {
        await authClient.signOut()
        window.location.href = "/login" // or wherever you want
    }

    return(
        <div className="hidden lg:flex flex-col h-screen w-64 border-r border-border bg-background">
            <div className="py-4 border-b mb-10 flex items-center justify-between px-4">
                
                <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10 bg-green-500 flex items-center justify-center">
                        <AvatarImage src={session.data?.user.image || ""}/>
                        <AvatarFallback>
                          {username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <p>{username}</p>
                </div>

                {/* ✅ Dropdown here */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Ellipsis className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="cursor-pointer"
                        >
                            <LogOut className="mr-2 h-4 w-4 text-red-500" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>

            <nav className="grid grid-cols-1 space-y-4">
                {navigation.map((nav, key) => {
                    const Icon = nav.icon 
                    const isActive = pathname === nav.href
                    return (
                        <Link href={nav.href} key={key}>
                            <Button
                                variant={isActive ? "default" : "ghost"}
                                className="w-full justify-start h-12 px-4"
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {nav.name}
                            </Button>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
