"use client"

import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { Check, CheckCircle, History, Home, MinusCircle, Play, PlusCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";


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
    return(
        <div className="hidden lg:flex flex-col h-screen w-64 border-r border-border bg-background">
            <div className="py-4 border-b mb-10">
                <div className="flex items-center px-4 space-x-4">
                    <Avatar className="h-10 w-10 bg-green-500 flex items-center justify-center">
                        <AvatarImage />
                        <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <p>{username}</p>
                </div>
            </div>
            <nav className="grid grid-cols-1 space-y-4 ">
                {
                    navigation.map((nav, key) => {
                        const Icon = nav.icon 
                        const isActive = pathname === nav.href
                        return (
                            <Link href={nav.href} key={key}>
                                <Button variant={isActive ? "default" : "ghost"} className={`w-full justify-start h-12 px-4`}><Icon /> {nav.name}</Button>
                            </Link>
                        )
                    })
                }
            </nav>
        </div>
    )
}