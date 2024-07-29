import React from "react";
import {
  Avatar,
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";
import { AddIcon } from "@chakra-ui/icons";
import { PiSignOutBold } from "react-icons/pi";
import { useRouter } from "next/navigation";

interface ProfileMenuDesktopProps {
  defaultAvatarSrc: string;
}

const ProfileMenuDesktop = ({ defaultAvatarSrc }: ProfileMenuDesktopProps) => {
  const { displayName, photoURL, signOut, user } = useAuth();
  const router = useRouter();

  return (
    <Menu placement="bottom" isLazy gutter={13}>
      <MenuButton
        as={IconButton}
        borderRadius="50%"
        bg="transparent"
        variant="solid"
        boxShadow="md"
        icon={
          <Avatar
            src={photoURL || defaultAvatarSrc}
            width="38px "
            height="38px"
          />
        }
        _hover={{ bg: "transparent", transform: "scale(1.1)" }}
        _active={{ bg: "transparent" }}
      />
      <MenuList py={5} boxShadow="md" width="200px" mr={4} bg="#f7f8f7">
        <VStack spacing={2} align="stretch">
          <VStack justifyContent="center" alignItems="center" mb={3}>
            <Avatar src={photoURL || defaultAvatarSrc} size="md" />
            <VStack spacing="1px">
              <Text fontSize="16px" fontWeight="600">
                {displayName || "歡迎"}
              </Text>
              <Text fontSize="13px" fontWeight="400" color={"brand.third"}>
                {user?.email}
              </Text>
            </VStack>
          </VStack>
          <Divider mx="auto" mb={2} width="90%" borderColor="brand.light" />
          <MenuItem
            py={2}
            px={6}
            icon={<AddIcon />}
            bg="#f7f8f7"
            fontSize="15px"
            _hover={{ bg: "brand.light" }}
            _focus={{ bg: "brand.light" }}
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </MenuItem>
          <MenuItem
            py={2}
            px={6}
            icon={<PiSignOutBold size="17px" />}
            bg="#f7f8f7"
            fontSize="15px"
            _hover={{ bg: "brand.light" }}
            _focus={{ bg: "brand.light" }}
            onClick={signOut}
          >
            Sign out
          </MenuItem>
        </VStack>
      </MenuList>
    </Menu>
  );
};

export default ProfileMenuDesktop;
