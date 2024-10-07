import { HStack, Tooltip, Text } from "@chakra-ui/react";
import { ReactNode } from "react";
import useDesignPageColor from "@/hooks/useDesignPageColor";

interface CustomTooltipProps {
  children: ReactNode;
  mainText: string;
  shortcutContent: ReactNode;
}

const CustomTooltip = ({
  children,
  mainText,
  shortcutContent,
}: CustomTooltipProps) => {
  const color = useDesignPageColor();

  return (
    <Tooltip
      px="8px"
      py="4px"
      borderRadius="3px"
      fontSize="13px"
      placement="bottom"
      bg={color.tooltip.backgroundColor}
      color={color.tooltip.text}
      offset={[0, 15]}
      label={
        <HStack spacing={2}>
          <Text>{mainText}</Text>
          <HStack
            fontSize="12px"
            color={color.tooltip.text}
            fontWeight="300"
            spacing={0}
          >
            {shortcutContent}
          </HStack>
        </HStack>
      }
    >
      {children}
    </Tooltip>
  );
};

export default CustomTooltip;
