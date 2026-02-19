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
    const session = await getSession();
    if (!session?.user?.id) redirect("/login");

    const user = {
        ...session.user,
        role: session.user.role ?? undefined,
        isBanned: session.user.isBanned ?? undefined,
        banReason: session.user.banReason ?? undefined,
        bannedUntil: session.user.bannedUntil ?? undefined,
    };


    return (
        <div className="relative mx-auto flex h-screen max-w-screen-3xl overflow-hidden bg-background">
            {/* background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* Large blobs */}
                <div className="absolute -top-40 left-1/2 h-130 w-130 -translate-x-1/2 rounded-full bg-linear-to-br from-fuchsia-500/25 via-indigo-500/20 to-cyan-500/20 blur-3xl" />
                <div className="absolute -bottom-48 -left-24 h-130 w-130 rounded-full bg-linear-to-br from-emerald-500/20 via-teal-500/15 to-sky-500/15 blur-3xl" />

                {/* Medium blobs */}
                <div className="absolute top-32 right-20 h-65 w-65 rounded-full bg-linear-to-br from-pink-500/20 via-purple-500/15 to-indigo-500/20 blur-2xl" />
                <div className="absolute bottom-24 right-1/3 h-75 w-75 rounded-full bg-linear-to-br from-cyan-400/20 via-blue-400/15 to-indigo-400/20 blur-2xl" />

                {/* Small floating circles */}
                <div className="absolute top-20 left-20 h-32 w-32 rounded-full bg-fuchsia-500/20 blur-2xl" />
                <div className="absolute top-1/3 right-12 h-24 w-24 rounded-full bg-cyan-400/20 blur-xl" />
                <div className="absolute bottom-32 left-1/4 h-20 w-20 rounded-full bg-indigo-500/20 blur-xl" />
                <div className="absolute bottom-20 right-10 h-28 w-28 rounded-full bg-emerald-400/20 blur-2xl" />
                <div className="absolute top-1/2 left-10 h-16 w-16 rounded-full bg-pink-400/25 blur-xl" />
                <div className="absolute top-2/3 right-1/4 h-14 w-14 rounded-full bg-sky-400/25 blur-lg" />
                <div className="absolute top-10 right-1/3 h-18 w-18 rounded-full bg-purple-500/20 blur-xl" />
                <div className="absolute bottom-10 left-10 h-24 w-24 rounded-full bg-teal-400/20 blur-2xl" />

                {/* Grid texture */}
                <div className="absolute inset-0 opacity-40 bg-size-[18px_18px] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)]" />

                {/* Bottom fade */}
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/10 dark:to-black/30" />
            </div>


            {/* content */}
            <div className="relative z-10 flex h-full w-full">
                <Sidebar />
                <MobileBar />

                <main className="grid flex-1 grid-cols-12">
                    <div className="col-span-12 lg:col-span-10 w-full overflow-auto p-4">
                        {/* optional: glass panel */}
                        <div className="min-h-full rounded-2xl border bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/50">
                            <div className="p-4">{children}</div>
                        </div>
                    </div>

                    <div className="hidden lg:block lg:col-span-2">
                        <div className="h-full max-h-screen border-l bg-background/60 backdrop-blur supports-backdrop-filter:bg-background/40">
                            <LongChat user={user} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
