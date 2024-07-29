"use client";

import { HStack, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <HStack
      bg="brand.secondary"
      width="100%"
      height="95px"
      justifyContent="center"
      alignItems="center"
    >
      <Text letterSpacing={2} fontWeight="200">
        Copyright © 2024 Plan A
      </Text>
    </HStack>
  );
};

export default Footer;
