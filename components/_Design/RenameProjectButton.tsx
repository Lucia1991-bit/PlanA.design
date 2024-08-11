import React, { useState, useRef } from "react";
import {
  Button,
  Text,
  Input,
  useOutsideClick,
  Tooltip,
} from "@chakra-ui/react";
import { useBoardOperations } from "@/hooks/useBoardOperations ";
import useDesignPageColor from "@/hooks/useDesignPageColor";

interface RenameProjectButtonProps {
  boardId: string;
  initialName: string;
}

const RenameProjectButton: React.FC<RenameProjectButtonProps> = ({
  boardId,
  initialName,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const { renameBoard, isLoading } = useBoardOperations();
  const inputRef = useRef<HTMLInputElement>(null);

  const color = useDesignPageColor();

  useOutsideClick({
    ref: inputRef,
    handler: () => {
      if (isEditing) {
        handleRename();
      }
    },
  });

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleRename = async () => {
    const trimmedName = name.trim();
    if (trimmedName && trimmedName !== initialName) {
      await renameBoard(boardId, trimmedName);
      setName(trimmedName);
    } else if (!trimmedName) {
      setName(initialName);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleRename();
    } else if (e.key === "Escape") {
      setName(initialName);
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const sharedStyles = {
    width: "150px",
    height: "35px",
    fontWeight: "500",
    fontSize: "18px",
    bg: "transparent",
    color: color.navBar.text,
  };

  return (
    <Tooltip
      label="修改專案名稱"
      placement="bottom"
      offset={[0, 15]}
      bg={color.tooltip.backgroundColor}
      color={color.tooltip.text}
    >
      <Button
        ml={2}
        px="0"
        onClick={handleClick}
        isLoading={isLoading}
        variant="ghost"
        {...sharedStyles}
        display="flex"
        justifyContent="flex-start"
        alignItems="center"
        textAlign="left"
        _hover={{ bg: "transparent" }}
      >
        {isEditing ? (
          <Input
            ref={inputRef}
            value={name}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleRename}
            placeholder={name}
            {...sharedStyles}
            border="none"
            outline="none"
            _focus={{
              bg: color.navBar.hover,
              boxShadow: `0 0 0 1px ${color.navBar.text}`,
            }}
            _hover={{
              bg: color.navBar.hover,
            }}
            _active={{
              bg: color.navBar.hover,
            }}
            _placeholder={{ color: color.navBar.text, opacity: 0.7 }}
            height="100%"
            pl="0"
          />
        ) : (
          <Text
            width="100%"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            isTruncated
          >
            {name}
          </Text>
        )}
      </Button>
    </Tooltip>
  );
};

export default RenameProjectButton;
