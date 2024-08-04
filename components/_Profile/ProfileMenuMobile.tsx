import React from "react";
import {
  Avatar,
  IconButton,
  Text,
  VStack,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Button,
  Box,
  Divider,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { PiSignOutBold } from "react-icons/pi";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface ProfileMenuMobileProps {
  defaultAvatarSrc: string;
}

const ProfileMenuMobile = ({ defaultAvatarSrc }: ProfileMenuMobileProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { signOut, user } = useAuth();
  const router = useRouter();

  const handleDashboardClick = () => {
    router.push("/dashboard");
    onClose(); // 跳轉頁面後關掉 Drawer
  };

  return (
    <>
      <IconButton
        bg="transparent"
        variant="ghost"
        icon={
          <Avatar
            src={user?.photoURL || defaultAvatarSrc}
            width="32px"
            height="32px"
          />
        }
        onClick={onOpen}
        _hover={{ bg: "transparent" }}
        _active={{ bg: "transparent" }}
        _focus={{ boxShadow: "none" }}
        aria-label="Open profile menu"
      />
      <Drawer
        isOpen={isOpen}
        placement="top"
        onClose={onClose}
        size="xs"
        autoFocus={false}
        preserveScrollBarGap
      >
        <DrawerOverlay bg="blackAlpha.300" />
        <DrawerContent bg="#f7f8f7" backdropFilter="blur(5px)">
          <DrawerHeader>
            <DrawerCloseButton _focus={{ outline: "none" }} />
            <Box width="120px" height="50px" position="relative">
              <Image
                src="/LOGO.png"
                alt="logo"
                sizes="100%"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </Box>
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch" mb={4}>
              <VStack justifyContent="center" alignItems="center" my={3}>
                <Avatar src={user?.photoURL || defaultAvatarSrc} size="md" />
                <VStack spacing="1px">
                  <Text
                    fontSize="18px"
                    fontWeight="600"
                    color="brand.dark"
                    letterSpacing={0.3}
                  >
                    {user?.displayName || "歡迎使用"}
                  </Text>
                  <Text fontSize="13px" fontWeight="400" color={"brand.third"}>
                    {user?.email}
                  </Text>
                </VStack>
              </VStack>
              <Divider borderColor="brand.light" mb={2} />
              <Button
                w="100%"
                leftIcon={<AddIcon fontSize="16px" />}
                justifyContent="center"
                variant="ghost"
                color="brand.dark"
                _hover={{ bg: "brand.light" }}
                _focus={{ bg: "brand.light" }}
                onClick={handleDashboardClick}
              >
                Dashboard
              </Button>
              <Button
                w="100%"
                leftIcon={<PiSignOutBold fontSize="20px" />}
                justifyContent="center"
                variant="ghost"
                onClick={signOut}
                color="brand.dark"
                _hover={{ bg: "brand.light" }}
                _focus={{ bg: "brand.light" }}
              >
                Sign out
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ProfileMenuMobile;
