import React, { useState } from "react";
import { EmailIcon, LockIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  border,
  Box,
  Button,
  FormControl,
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
import OAuth from "@/components/_Auth/OAuth";

type AlertStatus = "error" | "success";

interface AlertInfo {
  status: AlertStatus;
  title: string;
  message: string;
}

const AuthForm = () => {
  const [email, setEmail] = useState("test@plana-design.com");
  const [password, setPassword] = useState("123456");
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
    setTimeout(() => setAlertInfo(null), 2000);
  };

  //在註冊/登入表單間切換
  const handleTabChange = (index: number) => {
    setAlertInfo(null); // 清除 alert
    setEmail(""); // 清除 email 輸入
    setPassword(""); // 清除 password 輸入
  };

  //送出註冊/登入表單
  const handleAuth = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    setIsLoading(true);

    //firebase auth 註冊後可以直接登入
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }

      handleAlert({
        status: "success",
        title: isSignUp ? "歡迎加入" : "歡迎回來",
        message: "請稍候，為您跳轉至會員頁面",
      });

      setEmail("");
      setPassword("");
      setIsLoading(false);

      setTimeout(() => {
        closeAuthModal();
        router.push("/dashboard");
      }, 800);
    } catch (error) {
      const errorMessage = handleFirebaseError(error as AuthError);
      handleAlert({
        status: "error",
        title: isSignUp ? "註冊失敗" : "登入失敗",
        message: errorMessage,
      });
      setEmail("");
      setPassword("");
      setIsLoading(false);
    }
  };

  //表單
  const renderForm = (isSignUp: boolean) => (
    <VStack
      as="form"
      spacing={{ base: "13px", md: "18px", lg: "20px" }}
      py={{ base: "10px", md: "15px", lg: "20px" }}
      onSubmit={(e) => handleAuth(e, isSignUp)}
    >
      {alertInfo && (
        <Alert
          status={alertInfo.status}
          borderRadius="5px"
          variant="solid"
          bg={alertInfo.status === "error" ? "red.50" : "green.50"}
          borderLeft="4px solid"
          borderLeftColor={
            alertInfo.status === "error" ? "red.500" : "green.500"
          }
          opacity={1}
          color="brand.dark"
          boxShadow="sm"
        >
          <AlertIcon
            color={alertInfo.status === "error" ? "red.500" : "green.500"}
          />
          <Box>
            <AlertTitle
              fontSize={{ base: "15px", md: "17px", lg: "18px" }}
              fontWeight="bold"
            >
              {alertInfo.title}
            </AlertTitle>
            <AlertDescription
              fontSize={{ base: "13px", md: "15px", lg: "16px" }}
            >
              {alertInfo.message}
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {!isSignUp && (
        <Text
          fontSize={{ base: "13px", md: "14px", lg: "15px" }}
          color="gray.600"
        >
          歡迎使用測試帳號登入體驗
        </Text>
      )}

      <FormControl>
        <InputGroup>
          <InputLeftElement
            pointerEvents="none"
            height={{ base: "45px", md: "48px", lg: "50px" }}
          >
            <EmailIcon fontSize={{ base: "18px", md: "19px", lg: "20px" }} />
          </InputLeftElement>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            height={{ base: "45px", md: "48px", lg: "50px" }}
            border="none"
            type="email"
            placeholder="請輸入電子信箱"
            isRequired
            bg="white"
            _focus={focusStyles}
            _placeholder={{
              fontSize: { base: "14px", md: "15px", lg: "16px" },
              color: "#b5b5b5",
            }}
            sx={{
              "&:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 1000px white inset !important",
                WebkitTextFillColor: "inherit !important",
                caretColor: "inherit !important",
              },
              "&:-webkit-autofill:focus": {
                WebkitBoxShadow: "0 0 0 1000px white inset !important",
              },
            }}
          />
        </InputGroup>
      </FormControl>

      <FormControl>
        <InputGroup>
          <InputLeftElement
            pointerEvents="none"
            height={{ base: "45px", md: "48px", lg: "50px" }}
          >
            <LockIcon
              color="brandPrimary"
              fontSize={{ base: "18px", md: "19px", lg: "20px" }}
            />
          </InputLeftElement>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            border="none"
            type="password"
            placeholder={isSignUp ? "請輸入密碼(至少6個字母)" : "請輸入密碼"}
            height={{ base: "45px", md: "48px", lg: "50px" }}
            bg="white"
            _focus={focusStyles}
            _placeholder={{
              fontSize: { base: "14px", md: "15px", lg: "16px" },
              color: "#b5b5b5",
            }}
            sx={{
              "&:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 1000px white inset !important",
                WebkitTextFillColor: "inherit !important",
                caretColor: "inherit !important",
              },
              "&:-webkit-autofill:focus": {
                WebkitBoxShadow: "0 0 0 1000px white inset !important",
              },
            }}
          />
        </InputGroup>
      </FormControl>
      <Button
        type="submit"
        bg={brandPrimary}
        color="white"
        width="full"
        height={{ base: "45px", lg: "50px" }}
        fontSize={{ base: "14px", md: "15px", lg: "16px" }}
        _hover={{
          bg: `${brandHover}`,
        }}
        isLoading={isLoading}
        _loading={{
          bg: "#a02d2d",
          opacity: 1,
          cursor: "auto",
        }}
      >
        {isSignUp ? "註冊" : "登入"}
      </Button>
      <Text fontSize={{ base: "13px", md: "14px", lg: "15px" }} mt={4}>
        或選擇以Google帳號{isSignUp ? "註冊" : "登入"}
      </Text>
      <OAuth handleAlert={handleAlert} />
    </VStack>
  );

  return (
    <Box
      width="100%"
      maxWidth="450px"
      mt={12}
      px={{ base: "15px", md: "30px", lg: "25px" }}
    >
      <Tabs isFitted variant="line" isLazy onChange={handleTabChange}>
        <TabList>
          {["SIGN IN", "SIGN UP"].map((label, index) => (
            <Tab
              key={label}
              letterSpacing={2}
              borderColor="#c7c8c8"
              fontSize={{ base: "18px", lg: "20px" }}
              fontWeight="300"
              _selected={{
                color: brandPrimary,
                borderBottom: "2px solid",
                borderColor: brandPrimary,
                fontWeight: "400",
              }}
              _active={{
                boxShadow: "none",
                bg: "brand.light",
              }}
            >
              {label}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          <TabPanel>{renderForm(false)}</TabPanel>
          <TabPanel>{renderForm(true)}</TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AuthForm;
