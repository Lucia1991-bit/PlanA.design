import React from "react";
import { FaChevronLeft } from "react-icons/fa";
import { Box, keyframes, usePrefersReducedMotion } from "@chakra-ui/react";

interface SidePanelCloseButtonProps {
  color?: string;
  width?: string;
  height?: string;
  zIndex?: number;
  position?: "static" | "relative" | "absolute" | "fixed" | "sticky";
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  onClick: () => void;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  arrowColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

const SidePanelCloseButton: React.FC<SidePanelCloseButtonProps> = ({
  color = "currentColor",
  width = "93px",
  height = "377px",
  zIndex,
  position,
  top,
  left,
  right,
  bottom,
  onClick,
  shadowColor = "rgba(20,20,20,0.1)",
  shadowOpacity = 0.5,
  shadowBlur = 15,
  shadowOffsetX = 3,
  shadowOffsetY = 0,
  arrowColor,
  borderColor,
  borderWidth = 2,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  const moveLeftRight = keyframes`
    0%, 100% { transform: translate(-70%, -50%); }
    50% { transform: translate(-90%, -50%); }
  `;

  const animation = prefersReducedMotion
    ? undefined
    : `${moveLeftRight} 1s ease-in-out infinite`;

  const filterId = "soft-right-shadow-filter";

  return (
    <Box
      as="div"
      position={position}
      zIndex={zIndex}
      top={top}
      left={left}
      right={right}
      bottom={bottom}
      width={width}
      height={height}
      onClick={onClick}
    >
      <Box
        position="absolute"
        width={width}
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        cursor="pointer"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 110 387"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id={filterId} x="0" y="-10%" width="200%" height="120%">
              <feGaussianBlur in="SourceAlpha" stdDeviation={shadowBlur} />
              <feOffset
                dx={shadowOffsetX}
                dy={shadowOffsetY}
                result="offsetblur"
              />
              <feFlood floodColor={shadowColor} result="color" />
              <feComposite
                in="color"
                in2="offsetblur"
                operator="in"
                result="shadow"
              />
              <feComponentTransfer>
                <feFuncA type="linear" slope={shadowOpacity} />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="shadow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M86.1,77.7l-65.5-59c0,0,0,0,0,0L0,0v39.2v299.1v39.2l20.6-18.6c0,0,0,0,0,0l5.7-5.2l17.7-16l0,0l42-37.9
          c4.5-4.1,7.4-12,7.4-20.6v-181C93.5,89.6,90.7,81.7,86.1,77.7z"
            fill={color}
            stroke={borderColor}
            strokeWidth={borderWidth}
            filter={`url(#${filterId})`}
          />
        </svg>
      </Box>
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-70%, -50%)"
        animation={animation}
        cursor="pointer"
      >
        <FaChevronLeft color={arrowColor} />
      </Box>
    </Box>
  );
};

export default SidePanelCloseButton;
