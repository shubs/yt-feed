import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="w-full border-b border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start space-x-12 py-4">
          <Link to="/" className="text-xl font-medium hover:opacity-70 transition-opacity">
            Home
          </Link>
          <Link to="/feed" className="text-xl font-medium hover:opacity-70 transition-opacity">
            Feed
          </Link>
          <Link to="/creators" className="text-xl font-medium hover:opacity-70 transition-opacity">
            Creators
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;