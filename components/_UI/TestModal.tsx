import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormErrorMessage,
  Text,
} from "@chakra-ui/react";

interface BoardActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  type: "rename" | "delete";
  currentName?: string;
}

interface FormInputs {
  newName: string;
}

const TestModal: React.FC<BoardActionsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  currentName,
}) => {
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    trigger,
  } = useForm<FormInputs>({
    defaultValues: {
      newName: currentName || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ newName: currentName || "" });
      setLocalError(null);
    }
  }, [isOpen, currentName, reset]);

  const onSubmitForm = async (data: FormInputs) => {
    setLocalError(null);
    const isValid = await trigger();
    if (isValid) {
      if (data.newName.trim() === "") {
        setLocalError("請輸入新的名稱");
      } else {
        onSubmit(data.newName.trim());
        onClose();
      }
    }
  };

  const handleDelete = () => {
    onSubmit("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent as="form" onSubmit={handleSubmit(onSubmitForm)}>
        <ModalHeader>{type === "rename" ? "重新命名" : "刪除確認"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {type === "rename" ? (
            <FormControl isInvalid={!!errors.newName || !!localError}>
              <Input
                {...register("newName", {
                  required: "請輸入新的名稱",
                  minLength: { value: 1, message: "名稱不能為空" },
                  maxLength: { value: 50, message: "名稱不能超過50個字符" },
                })}
                placeholder={currentName}
                onChange={() => setLocalError(null)}
              />
              <FormErrorMessage>
                {errors.newName?.message || localError}
              </FormErrorMessage>
            </FormControl>
          ) : (
            <Text>確定要刪除這個設計嗎？</Text>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            取消
          </Button>
          <Button
            colorScheme="blue"
            type={type === "rename" ? "submit" : "button"}
            isLoading={isSubmitting}
            onClick={type === "delete" ? handleDelete : undefined}
          >
            確定
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TestModal;
