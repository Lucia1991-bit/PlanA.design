import useDesignColor from "@/hooks/useDesignPageColor";
import Image from "next/image";
import { Box, Text, VStack } from "@chakra-ui/react";

interface SidePanelHeaderProps {
  title: string;
  description?: string;
  instruction?: string;
  image?: string;
}

const SidePanelHeader = ({
  title,
  description,
  instruction,
  image,
}: SidePanelHeaderProps) => {
  const color = useDesignColor();

  return (
    <Box width="100%" px={3}>
      <Text
        fontWeight="600"
        fontSize="18px"
        color={color.toolBar.text}
        mb="5px"
      >
        {title}
      </Text>

      <Text fontSize="14px" color={color.toolBar.subText} mb="5px">
        {description}
      </Text>
      {image && (
        <Image
          priority
          src={image}
          width={300}
          height={100}
          alt="gif"
          draggable="false"
        />
      )}
      <Text fontSize="13px" color={color.toolBar.subText} mt="5px">
        {instruction}
      </Text>
    </Box>
  );
};

export default SidePanelHeader;
