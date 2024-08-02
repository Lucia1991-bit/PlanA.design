"use client";
import React from "react";
import LoadingLogo from "@/components/_Loading/LoadingLogo";
import { Flex, Text, StackProps, VStack } from "@chakra-ui/react";

//可改變 FlexProps的屬性以及Text內容
interface LoadingProps extends StackProps {
  text?: string;
}

const LogoLoadingPage = ({ text, ...stackProps }: LoadingProps) => {
  return (
    <VStack
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bg="#ecebeb"
      spacing={6}
      {...stackProps}
    >
      <LoadingLogo />
      {text && (
        <Text
          fontSize="25px"
          fontWeight="300"
          color="brand.primary"
          letterSpacing={2}
        >
          {text}
        </Text>
      )}
    </VStack>
  );
};

export default LogoLoadingPage;
