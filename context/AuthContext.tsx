"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  User,
} from "firebase/auth";
import { useDisclosure } from "@chakra-ui/react";

interface AuthContextType {
  user: User | null;
  displayName: string | null;
  photoURL: string | null;
  isAuthModalOpen: boolean;
  isLoading: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

//建立認證相關的 context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  //使用 ChakraUI 自帶的 控制 modal 開關元件
  const {
    isOpen: isAuthModalOpen,
    onOpen: openAuthModal,
    onClose: closeAuthModal,
  } = useDisclosure();

  //檢查使用者登入狀態
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setDisplayName(user?.displayName || null);
      setPhotoURL(user?.photoURL || null);
      setIsLoading(false); // 更新加載狀態
    });
    return unsubscribe;
  }, []);

  //註冊
  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    setUser(userCredential.user);
  };

  //登入
  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  //登入 google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    setDisplayName(userCredential.user.displayName);
    setPhotoURL(userCredential.user.photoURL);
  };

  //登出
  const signOut = async () => {
    await auth.signOut();
    setUser(null);
    setDisplayName(null);
    setPhotoURL(null);
  };

  const contextValue: AuthContextType = {
    user,
    displayName,
    photoURL,
    isAuthModalOpen,
    isLoading,
    openAuthModal,
    closeAuthModal,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
