import { Home, PlaySquare, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();
  const navItems = [
    { name: "Home", url: "/", icon: Home },
    { name: "Feed", url: "/feed", icon: PlaySquare },
    { name: "Creators", url: "/creators", icon: Users },
  ];

  return (
    <div className="sticky top-0 z-50 w-full bg-background/50 backdrop-blur-lg border-b">
      <nav className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.url;

            return (
              <Link
                key={item.name}
                to={item.url}
                className={cn(
                  "flex items-center space-x-2 text-muted-foreground hover:text-accent transition-colors",
                  isActive && "text-accent"
                )}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Navigation;