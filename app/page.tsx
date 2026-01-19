import AvailableLobbies from "@/components/available-lobbies";
import BannerEvent from "@/components/banner-event";
import MainLayout from "@/components/main-layout";
import PlayButton from "@/components/play-button";
import { getSession } from "@/lib/auth/auth-actions";
import { redirect } from "next/navigation";


export default async function Home() {
      const session = await getSession()
      if (!session){
          redirect('/register')
      }
  return (
    <MainLayout>
      <BannerEvent />
      <PlayButton />
      <AvailableLobbies />
    </MainLayout>
  );
}
