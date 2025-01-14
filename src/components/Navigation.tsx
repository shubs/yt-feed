import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/75 border-b border-black/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start space-x-12 py-4">
          {[
            { to: "/", label: "Home" },
            { to: "/feed", label: "Feed" },
            { to: "/creators", label: "Creators" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`relative text-xl font-medium transition-colors hover:text-primary group ${
                location.pathname === to ? "text-primary" : "text-gray-600"
              }`}
            >
              {label}
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300 ease-out scale-x-0 group-hover:scale-x-100" />
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;