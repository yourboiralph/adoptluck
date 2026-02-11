
import MobileBar from "./mobile-bar";
import { Sidebar } from "./sidebar";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-background relative">
            <Sidebar />
            <MobileBar />
            <main className="flex-1 grid grid-cols-12">
                <div className="col-span-12 lg:col-span-10 w-full border p-4 overflow-auto">{children}</div>
                <div className="hidden lg:col-span-2"></div>
            </main>
        </div>
    );
}
