import { HStack } from "@chakra-ui/react";
import React from "react";
import ProfileMenu from "../_Profile/ProfileMenu";
import Info from "./Info";
import useDesignColor from "@/hooks/useDesignColor";

const DesignNavBar = () => {
  const color = useDesignColor();

  return (
    <HStack
      bgColor={color.navBar.backgroundColor}
      color={color.navBar.text}
      backdropFilter="blur(4px)"
      boxShadow="lg"
      width="100%"
      height="60px"
      position="fixed"
      top="0"
      zIndex="2"
      paddingX="80px"
      justifyContent="space-between"
      alignItems="center"
      borderBottom={`0.5px solid ${color.navBar.backgroundColor}`}
    >
      <Info />
      <ProfileMenu isDesignPage={true} />
    </HStack>
  );
};

export default DesignNavBar;
