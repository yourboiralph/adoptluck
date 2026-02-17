import MainLayout from "@/components/main-layout";
import PetImage from "@/components/pet-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import WithdrawPageComponent from "@/components/withdraw-page";
import prisma from "@/lib/prisma";



export default async function WithdrawPage() {
    const botUser = "Bubblerice1"
    const botLink = "https://www.roblox.com/share?code=ba96d96ce77a504091d7a40160b67118&type=Server"
    return (
        <MainLayout>
            <WithdrawPageComponent />
        </MainLayout>
    )

}