import { Sidebar } from "./sidebar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 grid grid-cols-12">
                <div className="col-span-10 w-full border p-4 overflow-auto">{children}</div>
            </main>
        </div>
    );
}
