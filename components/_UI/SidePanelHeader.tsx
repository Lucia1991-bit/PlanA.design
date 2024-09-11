import useDesignColor from "@/hooks/useDesignPageColor";
import Image from "next/image";
import { Box, Text, VStack } from "@chakra-ui/react";

interface SidePanelHeaderProps {
  title: string;
  description?: string;
  instruction?: string;
  videoUrl?: string;
}

const SidePanelHeader = ({
  title,
  description,
  instruction,
  videoUrl,
}: SidePanelHeaderProps) => {
  const color = useDesignColor();

  return (
    <Box width="100%" px={3}>
      <Text
        fontWeight="600"
        fontSize="18px"
        color={color.toolBar.text}
        mb="10px"
      >
        {title}
      </Text>

      <Text
        fontSize="14px"
        fontWeight="300"
        color={color.toolBar.text}
        mb="10px"
        whiteSpace="pre-line"
        lineHeight="1.6"
        sx={{
          "& > p": {
            marginBottom: "8px",
          },
        }}
      >
        {description}
      </Text>
      {videoUrl && (
        <Box width="300px" height="200px" position="relative" overflow="hidden">
          <video
            src={videoUrl}
            width="100%"
            height="100%"
            loop
            muted
            autoPlay
            playsInline
            style={{ objectFit: "contain" }}
          />
        </Box>
      )}
      <Text
        fontSize="14px"
        fontWeight="300"
        color={color.toolBar.text}
        mt="5px"
      >
        {instruction}
      </Text>
    </Box>
  );
};

export default SidePanelHeader;
