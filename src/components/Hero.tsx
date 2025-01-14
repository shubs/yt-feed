import { Link } from "react-router-dom";
import Button from "./Button";

const Hero = () => {
  const videoCount = 12; // This would typically come from your data/API

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-5xl sm:text-7xl font-bold mb-8 max-w-4xl">
        Welcome to your YT feed
      </h1>
      <p className="text-2xl sm:text-3xl mb-12 max-w-2xl">
        There are currently {videoCount} videos for Today
      </p>
      <Link to="/feed">
        <Button>
          Feed
        </Button>
      </Link>
    </div>
  );
};

export default Hero;