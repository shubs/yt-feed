import { motion } from "framer-motion";

const HeroHeader = () => {
  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-5xl sm:text-7xl font-bold mb-8 text-red-500 text-center"
      >
        Your Gateway to Inspirational Content
      </motion.h1>
    </>
  );
};

export default HeroHeader;