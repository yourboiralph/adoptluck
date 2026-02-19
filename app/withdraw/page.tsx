import MainLayout from "@/components/main-layout";
import PetImage from "@/components/pet-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import WithdrawPageComponent from "@/components/withdraw-page";
import prisma from "@/lib/prisma";



export default async function WithdrawPage() {
    const botRes = await prisma.bot.findFirst({
        where: {
            status: "AVAILABLE"
        }
    })

    const botUser = botRes?.name ?? "NO BOTS AVAILABLE"
    const botLink = botRes?.bot_link ?? "NO BOTS AVAILABLE"
    return (
        <MainLayout>
            <WithdrawPageComponent botUser={botUser} botLink={botLink} />
        </MainLayout>
    )

}