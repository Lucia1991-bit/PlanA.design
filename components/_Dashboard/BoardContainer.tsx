import { Box, BoxProps } from "@chakra-ui/react";
import { ReactNode } from "react";

interface Props extends BoxProps {
  children: ReactNode;
  hoverStyles?: BoxProps;
}

const BoardContainer = ({ children, hoverStyles, ...rest }: Props) => {
  return (
    <Box
      borderRadius="10px"
      borderColor="rgba(199,200,201, 0.1)"
      aspectRatio="3/3.5"
      _hover={hoverStyles}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default BoardContainer;
