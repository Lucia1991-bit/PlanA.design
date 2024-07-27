import {
  AbsoluteCenter,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Divider,
  HStack,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { auth } from "@/app/ lib/firebase";
import { GoogleAuthProvider, signInWithPopup, AuthError } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { DiBackbone } from "react-icons/di";

interface AlertInfo {
  status: "error" | "success";
  title: string;
  message: string;
}

const OAuth = () => {
  return (
    <IconButton
      boxShadow="md"
      size="lg"
      bg="white"
      borderRadius="50%"
      aria-label="google"
      mb="-15px"
      icon={<FcGoogle fontSize="30px" />}
    />
  );
};

export default OAuth;
