import { useEffect, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
} from "@chakra-ui/react";

interface ClearCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ClearCanvasModal = ({
  isOpen,
  onClose,
  onConfirm,
}: ClearCanvasModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "xs", sm: "sm", md: "md", lg: "lg" }}
      preserveScrollBarGap
    >
      <ModalOverlay />
      <ModalContent
        ref={modalRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        bg="brand.primary_light"
      >
        <ModalHeader fontSize={{ base: "lg" }}>清空畫布</ModalHeader>
        <ModalCloseButton _focus={{ outline: "none", boxShadow: "none" }} />
        <ModalBody>
          <Text>確定要清空畫布嗎？此操作無法撤銷。</Text>
        </ModalBody>
        <ModalFooter>
          <Button
            borderColor="brand.light"
            color="brand.dark"
            variant="outline"
            mr={3}
            _hover={{
              bg: "brand.light",
            }}
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            bg="brand.primary"
            color="white"
            onClick={handleConfirm}
            _hover={{
              bg: "brand.hover",
            }}
          >
            確定清空
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ClearCanvasModal;
