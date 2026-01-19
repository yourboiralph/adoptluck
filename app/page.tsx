import AvailableLobbies from "@/components/available-lobbies";
import BannerEvent from "@/components/banner-event";
import MainLayout from "@/components/main-layout";
import PlayButton from "@/components/play-button";


export default function Home() {
  return (
    <MainLayout>
      <BannerEvent />
      <PlayButton />
      <AvailableLobbies />
    </MainLayout>
  );
}
