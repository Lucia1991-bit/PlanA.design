import { useToast, Box, Flex, Text, CloseButton } from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";

export const useCustomToast = () => {
  const toast = useToast();

  const showToast = (title: string, status: "success" | "error") => {
    toast({
      duration: 2000,
      position: "top-right",
      isClosable: true,
      render: ({ onClose }) => (
        <Box
          color="brand.dark"
          p={3}
          bg="#ffffff"
          borderRadius="md"
          border="1px solid"
          borderColor="brand.light"
          borderLeft="4px solid"
          borderLeftColor={status === "success" ? "green.500" : "red.500"}
          boxShadow="md"
          mt="120px"
        >
          <Flex justify="space-between" align="center">
            <Flex align="center">
              {status === "success" ? (
                <CheckCircleIcon mr={2} color="green.500" />
              ) : (
                <WarningIcon mr={2} color="red.500" />
              )}
              <Text fontSize={{ base: "14px", lg: "16px" }} fontWeight="medium">
                {title}
              </Text>
            </Flex>
            <CloseButton size="sm" onClick={onClose} />
          </Flex>
        </Box>
      ),
      containerStyle: {
        marginRight: "20px",
        maxWidth: { base: "250px", lg: "300px" },
      },
    });
  };

  return showToast;
};
