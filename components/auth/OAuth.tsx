import { useRouter } from "next/navigation";
import { IconButton } from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/hooks/useAuth";

interface OAuthProps {
  handleAlert: (info: {
    status: "error" | "success";
    title: string;
    message: string;
  }) => void;
}

const OAuth = ({ handleAlert }: OAuthProps) => {
  const { signInWithGoogle, closeAuthModal } = useAuth();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      handleAlert({
        status: "success",
        title: "登入成功",
        message: "請稍候，為您跳轉至會員頁面",
      });
      setTimeout(() => {
        closeAuthModal();
        router.push("/dashboard");
      }, 800);
    } catch (error) {
      console.error("Google登入錯誤:", error);
      handleAlert({
        status: "error",
        title: "登入失敗",
        message: "登入過程發生錯誤，請稍後再試",
      });
    }
  };

  return (
    <IconButton
      boxShadow="md"
      bg="white"
      borderRadius="50%"
      aria-label="google"
      mb="-5px"
      w={{ base: "40px", lg: "45px" }}
      h={{ base: "40px", lg: "45px" }}
      fontSize={{ base: "23px", lg: "28px" }}
      icon={<FcGoogle />}
      onClick={handleGoogleSignIn}
      _hover={{
        bg: "brand.light",
      }}
    />
  );
};

export default OAuth;
