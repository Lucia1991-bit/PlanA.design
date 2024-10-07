import React from "react";
import { useBreakpointValue } from "@chakra-ui/react";
import ProfileMenuDesktop from "./ProfileMenuDesktop";
import ProfileMenuMobile from "./ProfileMenuMobile";
import { useAuth } from "@/hooks/useAuth";

//預設頭像圖片
const DEFAULT_AVATAR_SRC = "/icons/profile-02.svg";

//確認是不是在設計頁面
interface ProfileMenuProps {
  isDesignPage?: boolean;
}

const ProfileMenu = ({ isDesignPage }: ProfileMenuProps) => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const { isLoading } = useAuth();

  if (isLoading) {
    return null; // 或者返回一个加载指示器
  }

  if (isMobile) {
    return <ProfileMenuMobile defaultAvatarSrc={DEFAULT_AVATAR_SRC} />;
  }

  return (
    <ProfileMenuDesktop
      defaultAvatarSrc={DEFAULT_AVATAR_SRC}
      isDesignPage={isDesignPage}
    />
  );
};

export default ProfileMenu;
