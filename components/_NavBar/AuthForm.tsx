import { EmailIcon, LockIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftElement,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import OAuth from "@/components/_NavBar/OAuth";

const AuthForm = () => {
  const theme = useTheme();
  const brandPrimary = theme.colors.brand.primary;
  const brandSecondary = theme.colors.brand.secondary;
  const brandHover = theme.colors.brand.hover;

  const focusStyles = {
    outline: "none",
    boxShadow: "none",
    borderColor: "#c6332e",
  };

  return (
    <Box width="100%" mt={12} py={8} px="25px">
      <Tabs isFitted variant="line" colorScheme="red" isLazy>
        <TabList>
          <Tab
            letterSpacing={2}
            borderColor="#c7c8c8"
            fontSize="20px"
            fontWeight="300"
            _selected={{
              color: brandPrimary,
              borderBottom: "2px solid",
              borderColor: brandPrimary,
              fontWeight: "400",
            }}
          >
            SIGN UP
          </Tab>
          <Tab
            letterSpacing={2}
            borderColor="#c7c8c8"
            fontSize="20px"
            fontWeight="300"
            _selected={{
              color: brandPrimary,
              borderBottom: "2px solid",
              borderColor: brandPrimary,
              fontWeight: "400",
            }}
          >
            SIGN IN
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <VStack as="form" spacing={5} py={5}>
              <FormControl>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" height="50px">
                    <EmailIcon fontSize="20px" />
                  </InputLeftElement>
                  <Input
                    border="none"
                    type="email"
                    placeholder="請輸入電子信箱"
                    height="50px"
                    isRequired
                    bg="white"
                    _focus={focusStyles}
                  />
                </InputGroup>
                <FormErrorMessage>Email is required.</FormErrorMessage>
              </FormControl>

              <FormControl>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" height="50px">
                    <LockIcon color="brandPrimary" fontSize="20px" />
                  </InputLeftElement>
                  <Input
                    border="none"
                    type="password"
                    placeholder="請輸入密碼(至少6個字母)"
                    height="50px"
                    bg="white"
                    _focus={focusStyles}
                  />
                </InputGroup>
                <FormErrorMessage>Email is required.</FormErrorMessage>
              </FormControl>
              <Button
                type="submit"
                bg={brandPrimary}
                color="white"
                width="full"
                height="50px"
                _hover={{
                  bg: `${brandHover}`,
                }}
              >
                註冊
              </Button>
              <Text fontSize="15px" mt={4}>
                或選擇以Google繼續
              </Text>
              <OAuth></OAuth>
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack as="form" spacing={5} py={5}>
              <FormControl>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" height="50px">
                    <EmailIcon fontSize="20px" />
                  </InputLeftElement>
                  <Input
                    border="none"
                    type="email"
                    placeholder="請輸入電子信箱"
                    height="50px"
                    isRequired
                    bg="white"
                    _focus={focusStyles}
                  />
                </InputGroup>
                <FormErrorMessage>Email is required.</FormErrorMessage>
              </FormControl>

              <FormControl>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" height="50px">
                    <LockIcon fontSize="20px" />
                  </InputLeftElement>
                  <Input
                    border="none"
                    type="password"
                    placeholder="請輸入密碼"
                    height="50px"
                    isRequired
                    bg="white"
                    _focus={focusStyles}
                  />
                </InputGroup>
                <FormErrorMessage>Email is required.</FormErrorMessage>
              </FormControl>
              <Button
                type="submit"
                bg={brandPrimary}
                color="white"
                width="full"
                height="50px"
                _hover={{
                  bg: `${brandHover}`,
                }}
              >
                登入
              </Button>
              <Text fontSize="15px" mt={4}>
                或選擇以Google繼續
              </Text>
              <OAuth></OAuth>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AuthForm;
