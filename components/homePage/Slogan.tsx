import { Text } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const MotionText = motion(Text);

const slogans = [
  "for your work.",
  "for your home.",
  "for your life.",
  "for your dream.",
];

const Slogan = () => {
  const [currentSlogan, setCurrentSlogan] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % slogans.length);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  const sloganVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <AnimatePresence mode="wait">
      <MotionText
        as="h2"
        key={currentSlogan}
        variants={sloganVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, transition: { duration: 0.5 } }}
        whiteSpace="nowrap"
        fontWeight="300"
        fontSize={{
          base: "40px",
          md: "63px",
          lg: "80px",
          xl: "85px",
        }}
        mt={{ base: "-15px", md: "-20px" }}
        color="brand.primary"
      >
        {slogans[currentSlogan].split("").map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1, delay: index * 0.05 }}
          >
            {char}
          </motion.span>
        ))}
      </MotionText>
    </AnimatePresence>
  );
};

export default Slogan;
