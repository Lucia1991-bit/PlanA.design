import { designPageColor } from "@/styles/designPageColor";
import { useDesignColorMode } from "@/context/colorModeContext";

const useDesignColor = () => {
  const { designColorMode } = useDesignColorMode();

  return designPageColor[designColorMode];
};

export default useDesignColor;
