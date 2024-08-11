import { designPageColor } from "@/styles/designPageColor";
import { useDesignColorMode } from "@/context/colorModeContext";

const useDesignPageColor = () => {
  const { designColorMode } = useDesignColorMode();

  return designPageColor[designColorMode];
};

export default useDesignPageColor;
