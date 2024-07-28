import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
} from "@chakra-ui/react";
import AuthForm from "./AuthForm";
import { useAuth } from "@/hooks/useAuth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: LoginModalProps) => {
  return (
    <Modal
      onClose={onClose}
      isOpen={isOpen}
      isCentered
      size="xl"
      preserveScrollBarGap
      autoFocus={false}
    >
      <ModalOverlay bg="blackAlpha.300" />

      <ModalContent
        borderRadius="15px"
        width={{ lg: "450px", base: "85%" }}
        minWidth="300px"
        bg="rgba(255, 255, 255, 0.65)"
        backdropFilter="blur(5px)"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <ModalCloseButton outline="none" _focus={{ outline: "none" }} />
        <AuthForm />
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;
