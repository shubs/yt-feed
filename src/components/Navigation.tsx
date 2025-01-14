import { Link, useLocation } from "react-router-dom";
import { Home, PlaySquare, Users } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/feed", label: "Feed", icon: PlaySquare },
    { to: "/creators", label: "Creators", icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-14">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center px-6 h-full border-b-2 transition-colors hover:text-accent ${
                location.pathname === to
                  ? "border-accent text-accent"
                  : "border-transparent text-gray-600 hover:border-gray-300"
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;