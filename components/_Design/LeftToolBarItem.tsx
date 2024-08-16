import { Box, Button, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";
import useDesignPageColor from "@/hooks/useDesignPageColor";

interface LeftToolBarItemProps {
  icon: string; //圖片 url
  label: string;
  isActive?: boolean;
  onClick: () => void;
  iconWidth?: string;
  iconHeight?: string;
  buttonWidth?: string;
  buttonHeight?: string;
  mt?: string;
  borderRadius?: string;
  imageFlex?: string;
  textFlex?: string;
  spacing?: string;
}

const LeftToolBarItem = ({
  icon,
  label,
  isActive,
  onClick,
  buttonWidth = "full",
  buttonHeight = "100px",
  borderRadius = "0",
  mt = "0",
  imageFlex = "1",
  textFlex = "0.4",
  iconWidth = "80%",
  iconHeight = "30px",
  spacing = "4px",
}: LeftToolBarItemProps) => {
  const color = useDesignPageColor();
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      width={buttonWidth}
      height={buttonHeight}
      aspectRatio="1"
      padding="0"
      display="flex"
      flexDirection="column"
      borderRadius={borderRadius}
      bg={isActive ? color.toolBar.hover : "transparent"}
      color={color.toolBar.text}
      _hover={{ bg: color.toolBar.hover }}
      _focus={{ outline: "none", boxShadow: "none" }}
    >
      <VStack width="100%" height="100%" spacing={spacing} p={2}>
        <Box
          width={iconWidth}
          height={iconHeight}
          position="relative"
          flex={imageFlex}
        >
          <Image
            priority
            src={icon}
            alt={label}
            fill
            sizes="(max-width: 768px) 24px, 30px"
            style={{ objectFit: "contain" }}
          />
        </Box>
        <Text fontSize="xs" flex={textFlex} mt={mt}>
          {label}
        </Text>
      </VStack>
    </Button>
  );
};

export default LeftToolBarItem;
