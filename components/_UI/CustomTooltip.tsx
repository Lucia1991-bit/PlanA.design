import { HStack, Tooltip, Text } from "@chakra-ui/react";
import { MdKeyboardCommandKey } from "react-icons/md";
import useDesignPageColor from "@/hooks/useDesignPageColor";

interface CustomTooltipProps {
  children: React.ReactNode;
  mainText: string;
  shortcutText: string;
}

const CustomTooltip = ({
  children,
  mainText,
  shortcutText,
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
            <MdKeyboardCommandKey />
            <Text>{shortcutText}</Text>
          </HStack>
        </HStack>
      }
    >
      {children}
    </Tooltip>
  );
};

export default CustomTooltip;
