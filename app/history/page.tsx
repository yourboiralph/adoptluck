import HistoryPageComponent from "@/components/history-page";
import MainLayout from "@/components/main-layout";
import Winrate from "@/components/winrate";



export default function HistoryPage() {

    return (
        <MainLayout>
            <Winrate />
            <HistoryPageComponent />
        </MainLayout>
    )
}