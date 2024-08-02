"use client";

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
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
export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
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
      setIsLoading(false); // 更新加載狀態
    });
    return unsubscribe;
  }, []);

  //註冊
  const signUp = useCallback(async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    setUser(userCredential.user);
  }, []);

  //登入
  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  //登入 google
  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  //登出
  const signOut = useCallback(async () => {
    await auth.signOut();
    setUser(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      isAuthModalOpen,
      isLoading,
      openAuthModal,
      closeAuthModal,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
    }),
    [
      user,
      isAuthModalOpen,
      isLoading,
      openAuthModal,
      closeAuthModal,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
