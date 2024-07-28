import React, { useState } from "react";
import { EmailIcon, LockIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
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
import { AuthError } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import OAuth from "@/components/_NavBar/OAuth";

type AlertStatus = "error" | "success";

interface AlertInfo {
  status: AlertStatus;
  title: string;
  message: string;
}

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState<AlertInfo | null>(null);
  const router = useRouter();

  const { signUp, signIn, closeAuthModal } = useAuth();

  const theme = useTheme();
  const brandPrimary = theme.colors.brand.primary;
  const brandHover = theme.colors.brand.hover;

  const focusStyles = {
    outline: "none",
    boxShadow: "none",
    borderColor: "#c6332e",
  };

  //firebase auth 錯誤 code
  const handleFirebaseError = (error: AuthError): string => {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "此信箱已被使用";
      case "auth/invalid-email":
        return "信箱格式不正確";
      case "auth/weak-password":
        return "密碼強度不足，密碼應至少為 6 個字母";
      case "auth/user-not-found":
        return "此信箱不存在";
      case "auth/wrong-password":
        return "密碼錯誤";
      case "auth/invalid-credential":
        return "信箱或密碼不正確，請重新輸入";
      default:
        return "發生未知錯誤，請稍後再試";
    }
  };

  //處理 alert 訊息
  const handleAlert = (info: AlertInfo) => {
    setAlertInfo(info);
    // 添加一個定時器來自動清除 alert
    setTimeout(() => setAlertInfo(null), 5000);
  };

  //送出註冊表單
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      //createUserWithEmailAndPassword 方法在成功註冊後會自動登入用戶
      await signUp(email, password);
      handleAlert({
        status: "success",
        title: "歡迎加入",
        message: "請稍候，為您跳轉至會員頁面",
      });
      setEmail("");
      setPassword("");
      setIsLoading(false);

      //延遲後跳轉至dashboard頁面
      setTimeout(() => {
        closeAuthModal();
        router.push("/dashboard");
      }, 500);
    } catch (error) {
      const errorMessage = handleFirebaseError(error as AuthError);
      handleAlert({
        status: "error",
        title: "註冊失敗",
        message: errorMessage,
      });
      setIsLoading(false);
    }
  };

  //送出登入表單
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      handleAlert({
        status: "success",
        title: "歡迎回來",
        message: "請稍候，為您跳轉至會員頁面",
      });
      setIsLoading(false);
      setEmail("");
      setPassword("");

      //延遲後跳轉至dashboard頁面
      setTimeout(() => {
        closeAuthModal();
        router.push("/");
      }, 500);
    } catch (error) {
      const errorMessage = handleFirebaseError(error as AuthError);
      handleAlert({
        status: "error",
        title: "登入失敗",
        message: errorMessage,
      });
      setIsLoading(false);
    }
  };

  return (
    <Box width="100%" mt={12} px={{ base: "15px", lg: "20px" }}>
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
          {/* 註冊表單 */}
          <TabPanel>
            <VStack
              as="form"
              spacing={{ base: "10px", lg: "20px" }}
              py={5}
              onSubmit={handleSignUp}
            >
              {alertInfo && (
                <Alert status={alertInfo.status} borderRadius="5px">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>{alertInfo.title}</AlertTitle>
                    <AlertDescription>{alertInfo.message}</AlertDescription>
                  </Box>
                </Alert>
              )}

              <FormControl>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" height="50px">
                    <EmailIcon fontSize="20px" />
                  </InputLeftElement>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                isLoading={isLoading}
              >
                註冊
              </Button>
              <Text fontSize="15px" mt={4}>
                或選擇以Google帳號註冊
              </Text>
              <OAuth handleAlert={handleAlert}></OAuth>
            </VStack>
          </TabPanel>

          {/* 登入表單 */}
          <TabPanel>
            <VStack
              as="form"
              spacing={{ base: "10px", lg: "20px" }}
              py={5}
              onSubmit={handleSignIn}
            >
              {alertInfo && (
                <Alert status={alertInfo.status} borderRadius="5px">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>{alertInfo.title}</AlertTitle>
                    <AlertDescription>{alertInfo.message}</AlertDescription>
                  </Box>
                </Alert>
              )}
              <FormControl>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" height="50px">
                    <EmailIcon fontSize="20px" />
                  </InputLeftElement>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                isLoading={isLoading}
              >
                登入
              </Button>
              <Text fontSize="15px" mt={4}>
                或選擇以Google帳戶登入
              </Text>
              <OAuth handleAlert={handleAlert} />
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AuthForm;
