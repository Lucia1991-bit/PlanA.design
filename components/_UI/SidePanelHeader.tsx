import useDesignColor from "@/hooks/useDesignColor";
import { Box, Text, VStack } from "@chakra-ui/react";

interface SidePanelHeaderProps {
  title: string;
  description?: string;
}

const SidePanelHeader = ({ title, description }: SidePanelHeaderProps) => {
  const color = useDesignColor();

  return (
    <Box width="100%" px={3}>
      <Text fontWeight="600" fontSize="18px" color={color.toolBar.text}>
        {title}
      </Text>
      <Text fontSize="13px" color={color.toolBar.subText}>
        {description}
      </Text>
    </Box>
  );
};

export default SidePanelHeader;
