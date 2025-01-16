import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Button from "../Button";

const NavigationButtons = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="space-y-8"
    >
      <div className="flex gap-4 justify-center">
        <Link to="/feed">
          <Button className="hover:scale-105 transition-transform duration-200">
            Your Feed
          </Button>
        </Link>
        <Link to="/creators">
          <Button className="hover:scale-105 transition-transform duration-200">
            Creators
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default NavigationButtons;