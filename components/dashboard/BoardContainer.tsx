import { Box, BoxProps, useBreakpointValue } from "@chakra-ui/react";
import { ReactNode } from "react";

interface Props extends BoxProps {
  children: ReactNode;
  hoverStyles?: BoxProps;
}

const BoardContainer = ({ children, hoverStyles, ...rest }: Props) => {
  const containerHeight = useBreakpointValue({ base: "auto", md: "0" });
  const containerPaddingBottom = useBreakpointValue({
    base: "0",
    md: "116.67%",
  }); // 3/3.5 aspect ratio

  return (
    <Box
      borderRadius="10px"
      borderColor="rgba(199,200,201, 0.1)"
      height={containerHeight}
      paddingBottom={containerPaddingBottom}
      position="relative"
      _hover={hoverStyles}
      {...rest}
    >
      <Box
        position={useBreakpointValue({ base: "static", md: "absolute" })}
        top="0"
        left="0"
        right="0"
        bottom="0"
      >
        {children}
      </Box>
    </Box>
  );
};

export default BoardContainer;
