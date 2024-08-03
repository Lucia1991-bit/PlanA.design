import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  VStack,
  keyframes,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { PiSignOutBold } from "react-icons/pi";
import { motion, stagger } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

interface ProfileMenuDesktopProps {
  defaultAvatarSrc: string;
}

//設置動畫
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(33px); }
  to { transform: translateY(0); }
`;

const ProfileMenuDesktop = ({ defaultAvatarSrc }: ProfileMenuDesktopProps) => {
  const { signOut, user } = useAuth();
  const router = useRouter();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const menuRef = useRef(null);

  const handleMouseEnter = () => {
    onOpen();
  };

  const handleMouseLeave = () => {
    onClose();
  };

  const animationStyles = {
    opacity: 0,
    animation: `${fadeIn} 0.35s ease-out forwards, ${slideUp} 0.4s ease-out forwards`,
  };

  return (
    <Box
      p={3}
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Menu isOpen={isOpen} placement="bottom" isLazy>
        <MenuButton
          as={IconButton}
          borderRadius="50%"
          bg="transparent"
          variant="solid"
          boxShadow="md"
          icon={
            <Avatar
              src={user?.photoURL || defaultAvatarSrc}
              width="38px "
              height="38px"
            />
          }
          _focus={{ boxShadow: "none", outline: "none" }}
          _active={{ bg: "transparent" }}
        />
        <MenuList py={6} boxShadow="md" width="200px" mr={4}>
          <VStack spacing={2} align="stretch">
            <Box sx={animationStyles} style={{ animationDelay: "0.1s, 0.1s" }}>
              <VStack justifyContent="center" alignItems="center" mb={3}>
                <Avatar src={user?.photoURL || defaultAvatarSrc} size="md" />
                <VStack spacing="1px">
                  <Text fontSize="16px" fontWeight="600" letterSpacing={0.3}>
                    {user?.displayName || "歡迎使用"}
                  </Text>
                  <Text fontSize="13px" fontWeight="400" color={"brand.third"}>
                    {user?.email}
                  </Text>
                </VStack>
              </VStack>
            </Box>
            <Divider mx="auto" mb={2} width="90%" borderColor="brand.light" />
            <MenuItem
              py={2}
              px={6}
              icon={<AddIcon />}
              fontSize="15px"
              _hover={{ bg: "brand.light" }}
              _focus={{ bg: "brand.light" }}
              onClick={() => router.push("/dashboard")}
              sx={animationStyles}
              style={{ animationDelay: "0.2s, 0.2s" }}
            >
              Dashboard
            </MenuItem>
            <MenuItem
              py={2}
              px={6}
              icon={<PiSignOutBold size="17px" />}
              fontSize="15px"
              _hover={{ bg: "brand.light" }}
              _focus={{ bg: "brand.light" }}
              onClick={signOut}
              sx={animationStyles}
              style={{ animationDelay: "0.3s, 0.3s" }}
            >
              Sign out
            </MenuItem>
          </VStack>
        </MenuList>
      </Menu>
    </Box>
  );
};

export default ProfileMenuDesktop;
