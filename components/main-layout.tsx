import { Sidebar } from "./sidebar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto">{children}</div>
            </main>
        </div>
    );
}
