import { Box, Button, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";
import useDesignPageColor from "@/hooks/useDesignPageColor";

interface LeftToolBarItemProps {
  icon: string; //圖片 url
  label: string;
  isActive?: boolean;
  onClick: () => void;
  iconSize?: string;
}

const LeftToolBarItem = ({
  icon,
  label,
  isActive,
  onClick,
  iconSize = "30px",
}: LeftToolBarItemProps) => {
  const color = useDesignPageColor();
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      width="full"
      height="100px"
      aspectRatio="1"
      padding="0"
      display="flex"
      flexDirection="column"
      borderRadius="0"
      bg={isActive ? color.toolBar.hover : "transparent"}
      color={color.toolBar.text}
      _hover={{ bg: color.toolBar.hover }}
    >
      <VStack width="100%" height="100%" spacing={1} p={2}>
        <Box width="80%" height={iconSize} position="relative" flex="1">
          <Image
            priority
            src={icon}
            alt={label}
            fill
            style={{ objectFit: "contain" }}
          />
        </Box>
        <Text fontSize="xs" flex="0.5">
          {label}
        </Text>
      </VStack>
    </Button>
  );
};

export default LeftToolBarItem;
