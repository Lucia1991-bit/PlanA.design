import { Box } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/">
      <Box position="relative" w="100px" h="40px">
        <Image
          src="/LOGO.png"
          alt="logo"
          sizes="100%"
          fill
          style={{ objectFit: "contain" }}
          priority
        />
      </Box>
    </Link>
  );
};

export default Logo;
