import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
} from "@chakra-ui/react";
import AuthForm from "./AuthForm";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: LoginModalProps) => {
  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered size="xl">
      <ModalOverlay bg="blackAlpha.300" />

      <ModalContent
        borderRadius="15px"
        width={{ lg: "450px", base: "85%" }}
        minWidth="300px"
        bg="rgba(255, 255, 255, 0.7)"
        backdropFilter="blur(4px)"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <ModalCloseButton _focus={{ outline: "none" }} />
        <AuthForm />
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;
