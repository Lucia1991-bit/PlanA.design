import { Box } from "@chakra-ui/react";
import { PropagateLoader } from "react-spinners";

const SimpleLoadingPage = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bg="brand.light"
    >
      <PropagateLoader color="#c6332e" size={15} speedMultiplier={1.5} />
    </Box>
  );
};

export default SimpleLoadingPage;
