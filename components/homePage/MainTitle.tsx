import { Text } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionText = motion(Text);

const MainTitle = () => {
  const mainTitleVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: 0.4,
      },
    },
  };

  return (
    <MotionText
      as="h1"
      variants={mainTitleVariants}
      initial="hidden"
      animate="visible"
      whiteSpace="nowrap"
      fontWeight="200"
      fontSize={{ base: "38px", md: "55px", lg: "70px", xl: "75px" }}
    >
      {"SHAPE A PLAN".split("").map((char, index) => (
        <motion.span key={index} variants={letterVariants}>
          {char}
        </motion.span>
      ))}
    </MotionText>
  );
};

export default MainTitle;
