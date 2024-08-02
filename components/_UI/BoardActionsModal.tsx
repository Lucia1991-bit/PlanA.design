import { useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  Text,
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";

//彈出視窗類型
type ModalType = "rename" | "delete";

interface BoardActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  type: ModalType;
  currentName?: string;
}

const modalConfig = {
  rename: {
    title: "重新命名",
    submitText: "確定",
    bodyText: "請輸入新的名稱",
  },
  delete: {
    title: "刪除確認",
    submitText: "確定",
    bodyText: "確定要刪除這個設計嗎？",
  },
};

const BoardActionsModal = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  currentName,
}: BoardActionsModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const config = modalConfig[type];

  useEffect(() => {
    if (isOpen && type === "rename" && inputRef.current) {
      inputRef.current.value = currentName || "";
      inputRef.current.focus();
      inputRef.current.select();
    }
    setError("");
  }, [isOpen, type, currentName]);

  const handleSubmit = () => {
    if (type === "rename" && inputRef.current) {
      const trimmedValue = inputRef.current.value.trim();
      if (trimmedValue === "") {
        setError("請輸入新的名稱");
        return;
      }
      onSubmit(trimmedValue);
    } else if (type === "delete") {
      onSubmit("");
    }
    onClose();
  };

  const handleInputChange = () => {
    setError("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "sm", md: "md", lg: "lg" }}
      preserveScrollBarGap
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{config.title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>{config.bodyText}</Text>
          {type === "rename" && (
            <FormControl isInvalid={!!error}>
              <Input
                required
                maxLength={20}
                borderColor="brand.light"
                ref={inputRef}
                onChange={handleInputChange}
                placeholder={currentName}
                mt={2}
                _focus={{
                  outline: "none",
                  boxShadow: "none",
                  borderColor: "brand.dark",
                }}
              />
            </FormControl>
          )}
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
            type="submit"
            bg="brand.primary"
            color="white"
            onClick={handleSubmit}
            _hover={{
              bg: "brand.hover",
            }}
            isDisabled={false}
          >
            {config.submitText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BoardActionsModal;
