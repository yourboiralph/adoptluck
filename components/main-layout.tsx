
import { getSession } from "@/lib/auth/auth-actions";
import LongChat from "./chatbox/longchat";
import MobileBar from "./mobile-bar";
import { Sidebar } from "./sidebar";
import { redirect } from "next/navigation";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const session = await getSession()
    if (!session?.user.id){
        redirect('/login')
    }
    const user = session.user
    return (
        <div className="flex h-screen bg-background relative mx-auto max-w-screen-3xl">
            <Sidebar />
            <MobileBar />
            <main className="flex-1 grid grid-cols-12">
                <div className="col-span-12 lg:col-span-10 w-full border p-4 overflow-auto">{children}</div>
                <div className="hidden lg:grid lg:col-span-2"><LongChat user={user} /></div>
            </main>
        </div>
    );
}
