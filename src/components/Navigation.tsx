import { Home, PlaySquare, Users } from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";

const Navigation = () => {
  const navItems = [
    { name: "Home", url: "/", icon: Home },
    { name: "Feed", url: "/feed", icon: PlaySquare },
    { name: "Creators", url: "/creators", icon: Users },
  ];

  return (
    <div className="sticky top-0 z-50">
      <NavBar items={navItems} className="sm:pt-4" />
    </div>
  );
};

export default Navigation;