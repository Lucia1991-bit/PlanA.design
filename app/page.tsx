"use client";
import {
  Box,
  Image as ChakraImage,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const MotionBox = motion(Box);

const HomePage = () => {
  //確保component只在客戶端渲染後才顯示內容
  const [mounted, setMounted] = useState(false);

  const imageSrc = useBreakpointValue({
    base: "https://res.cloudinary.com/datj4og4i/image/upload/v1722068270/%E6%89%8B%E6%A9%9F%E7%89%88%E9%A6%96%E5%9C%96_lg7pku.png",
    md: "https://res.cloudinary.com/datj4og4i/image/upload/v1722068272/%E9%9B%BB%E8%85%A6%E7%89%88%E9%A6%96%E5%9C%96_ky6vuu.png",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <Box width="100%" overflowX="hidden">
      <Box position="relative" width="100%" height="100vh" zIndex={-1}>
        <MotionBox
          position="relative"
          width="115%" // 增加容器寬度
          height="100vh"
          zIndex={-1}
          initial={{ x: "0%", opacity: 0 }}
          animate={{ x: "-8%", opacity: 1 }} // 向左移動容器
          transition={{
            x: { duration: 10, ease: "easeOut" },
            opacity: { duration: 1.5, ease: "easeIn" },
          }}
          style={{
            right: "0", // 確保右側對齊
          }}
        >
          <Image
            src={imageSrc}
            alt="Responsive Image"
            fill
            objectFit="cover"
            priority
          />
        </MotionBox>
      </Box>
      <Box width="100%" height="200vh">
        <div>說明</div>
      </Box>
    </Box>
  );
};

export default HomePage;
