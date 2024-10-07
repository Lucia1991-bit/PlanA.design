import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useBreakpointValue } from "@chakra-ui/react";

const MotionBox = motion(Box);

const BackgroundImage = () => {
  const defaultImageSrc =
    "https://res.cloudinary.com/datj4og4i/image/upload/v1722068272/%E9%9B%BB%E8%85%A6%E7%89%88%E9%A6%96%E5%9C%96_ky6vuu.png";

  const imageSrc =
    useBreakpointValue({
      base: "https://res.cloudinary.com/datj4og4i/image/upload/v1722068270/%E6%89%8B%E6%A9%9F%E7%89%88%E9%A6%96%E5%9C%96_lg7pku.png",
      md: "https://res.cloudinary.com/datj4og4i/image/upload/v1722068272/%E9%9B%BB%E8%85%A6%E7%89%88%E9%A6%96%E5%9C%96_ky6vuu.png",
    }) || defaultImageSrc;

  return (
    <MotionBox
      position="relative"
      width="115%"
      height="100vh"
      zIndex={-1}
      initial={{ x: "0%", opacity: 0 }}
      animate={{ x: "-8%", opacity: 1 }}
      transition={{
        x: { duration: 11, ease: "easeOut" },
        opacity: { duration: 1.8, ease: "easeIn" },
      }}
      style={{ right: "0" }}
    >
      <Image
        src={imageSrc}
        alt="Responsive Image"
        fill
        style={{ objectFit: "cover" }}
        priority
      />
    </MotionBox>
  );
};

export default BackgroundImage;
