import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerBody,
  DrawerProps,
  DrawerContentProps,
  Portal,
} from "@chakra-ui/react";

interface CustomDrawerProps extends Omit<DrawerProps, "children"> {
  contentProps?: DrawerContentProps;
  children: React.ReactNode;
}

const ToolDrawer: React.FC<CustomDrawerProps> = ({
  isOpen,
  onClose,
  placement = "left",
  size = "sm",
  contentProps,
  children,
  ...rest
}) => {
  return (
    <Portal>
      <Drawer
        isOpen={isOpen}
        placement={placement}
        onClose={onClose}
        size={size}
        {...rest}
      >
        <DrawerContent {...contentProps}>
          <DrawerBody>{children}</DrawerBody>
        </DrawerContent>
      </Drawer>
    </Portal>
  );
};

export default ToolDrawer;
