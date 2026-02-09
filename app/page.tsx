
import AvailableLobbiesServer from "@/components/available-lobbies.server";
import BannerEvent from "@/components/banner-event";
import MainLayout from "@/components/main-layout";
import PlayButton from "@/components/play-button";
import ShowResult from "@/components/show-result";
import { getSession } from "@/lib/auth/auth-actions";
import { getPets } from "@/lib/inventory/current-pets";
import { redirect } from "next/navigation";
import { Suspense } from "react";


export default async function Home() {
      const session = await getSession()
      if (!session){
          redirect('/register')
      }


  return (
    <MainLayout>
      <BannerEvent />
      <Suspense fallback={"Loading..."}>
        <PlayButton />
        <AvailableLobbiesServer />
      </Suspense>
    </MainLayout>
  );
}
