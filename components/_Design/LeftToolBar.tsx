import React, { useState } from "react";
import useDesignColor from "@/hooks/useDesignColor";
import { Text, VStack, useDisclosure, Button, Box } from "@chakra-ui/react";
import ToolDrawer from "./ToolDrawer";
import FurnitureLibrary from "./FurnitureLibrary";
import MaterialsLibrary from "./MaterialsLibrary";

const LeftToolBar = () => {
  const color = useDesignColor();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeDrawer, setActiveDrawer] = useState<
    "materials" | "furniture" | null
  >(null);

  const handleDrawerToggle = (drawer: "materials" | "furniture") => {
    if (activeDrawer === drawer && isOpen) {
      onClose();
      setActiveDrawer(null);
    } else {
      setActiveDrawer(drawer);
      onOpen();
    }
  };

  return (
    <>
      <VStack
        width="70px"
        height="200px"
        bgColor={color.toolBar.backgroundColor}
        boxShadow="lg"
        borderRadius="5px"
        position="absolute"
        top="50%"
        left="10px"
        transform="translateY(-50%)"
        zIndex="2"
        borderWidth="0.5px"
        borderColor={color.toolBar.hover}
        alignItems="center"
        justifyContent="space-around"
      >
        <Button
          w="50px"
          fontWeight="500"
          color={color.toolBar.text}
          _hover={{ bg: color.toolBar.hover }}
          onClick={() => handleDrawerToggle("materials")}
          variant="ghost"
        >
          <Text>材質庫</Text>
        </Button>
        <Button
          w="50px"
          fontWeight="500"
          color={color.toolBar.text}
          _hover={{ bg: color.toolBar.hover }}
          onClick={() => handleDrawerToggle("furniture")}
          variant="ghost"
        >
          <Text>家具庫</Text>
        </Button>
      </VStack>

      <ToolDrawer
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setActiveDrawer(null);
        }}
        placement="left"
        size="sm"
        contentProps={{
          mt: "200px",
          ml: "80px",
          height: "calc(100% - 300px)",
          borderRadius: "md",
          boxShadow: "lg",
          bg: color.toolBar.backgroundColor,
          color: color.toolBar.text,
          borderWidth: "0.5px",
          borderColor: color.toolBar.hover,
        }}
      >
        {activeDrawer === "materials" && <MaterialsLibrary />}
        {activeDrawer === "furniture" && <FurnitureLibrary />}
      </ToolDrawer>
    </>
  );
};

export default LeftToolBar;
