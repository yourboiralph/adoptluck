
import AvailableLobbiesServer from "@/components/available-lobbies.server";
import BannerEvent from "@/components/banner-event";
import MainLayout from "@/components/main-layout";
import PlayButton from "@/components/play-button";
import { Suspense } from "react";


export default async function Home() {
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
