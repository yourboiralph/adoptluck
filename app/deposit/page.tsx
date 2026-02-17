import MainLayout from "@/components/main-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";


export default function DepositPage() {
    const botUser = "Bubblerice1"
    const botLink = "https://www.roblox.com/share?code=ba96d96ce77a504091d7a40160b67118&type=Server"
    return (
        <MainLayout >
            <div className="flex items-center justify-center h-full">
                <Card className="relative mx-auto w-full max-w-2xl pt-0">
                    <img
                        src="/bubblerice1.png"
                        alt="Event cover"
                        className="relative z-20 aspect-video w-full object-cover"
                    />
                    <CardHeader>
                        <div className="bg-red-800 px-2 rounded-lg py-2 border border-red-600 mb-4">
                            <p className="text-red-100"> Watch out for fake bots! They will impersonate the bot. Make sure to check the correct username while trading.</p>
                        </div>
                        <CardAction>
                            <Badge variant={"destructive"}>Alert</Badge>
                        </CardAction>
                        <CardTitle>Deposit some pets and win!</CardTitle>
                        <CardDescription>
                            Join the server and look for the user <span className="text-green-500">"{botUser}"</span> located in the <span className="text-green-500">GIFTS🎁</span> area.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Link href={botLink} target="_blank" rel="noopener noreferrer" className="w-full">
                            <Button className="w-full">Join Server</Button>
                        </Link>

                    </CardFooter>
                </Card>
            </div>
        </MainLayout>
    )
}