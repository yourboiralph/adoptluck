"use client"
import { authClient } from "@/lib/auth/auth-client"
import { CheckCircle, History, MinusCircle, Play, PlusCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"

function getNavigation(username?: string){
    return [
        {name: "Play", href: "/", icon: Play},
        {name: "Deposit", href: "/deposit", icon: PlusCircle},
        {name: "Withdraw", href: "/withdraw", icon: MinusCircle},
        {name: "History", href: "/history", icon: History},
        {name: "Provably Fair", href: "/provably-fair", icon: CheckCircle},
    ]
}
export default function MobileBar() {

    const session = authClient.useSession()
    const username = session.data?.user.username ?? ""
    const pathname = usePathname()
    const navigation = getNavigation(username)
    return (
        <div className="flex border-2 border-gray-600 w-full fixed bottom-0 left-0 right-0 z-50 h-20 bg-white/10 backdrop-blur-md border-t shadow-lg lg:hidden">
            <nav className="flex justify-around items-center gap-2 w-full">
                {
                    navigation.map((nav, key) => {
                        const Icon = nav.icon 
                        const isActive = pathname === nav.href
                        return (
                            <Link href={nav.href} key={key} className={`w-full h-full flex items-center justify-center rounded-lg ${isActive ? "bg-gray-600" : ""}`} >
                                <Icon />
                            </Link>
                        )
                    })
                }
            </nav>
        </div>
    )
}