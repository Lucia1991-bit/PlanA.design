import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  AspectRatio,
  Show,
  useDisclosure,
  keyframes,
} from "@chakra-ui/react";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/_Auth/AuthModal";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);
const MotionVStack = motion(VStack);

const steps = [
  {
    title: "繪製空間",
    description: "使用繪製工具繪製牆面，系統自動識別並生成封閉空間",
    gifUrl: "/內容假圖.png",
    duration: 10000,
  },
  {
    title: "應用材質",
    description:
      "從材質庫內選擇材質，一鍵應用至相應的空間。可即時預覽效果，隨時更換以達到理想效果",
    gifUrl: "/內容假圖.png",
    duration: 8000,
  },
  {
    title: "擺放家具",
    description:
      "從家具庫內選擇家具，以拖曳方式擺放，可自由調整家具的位置、角度和尺寸",
    gifUrl: "/內容假圖.png",
    duration: 8000,
  },
  {
    title: "分享設計",
    description: "完成設計後，提供分享選項，可匯出並分享成果",
    gifUrl: "/內容假圖.png",
    duration: 8000,
  },
];

const moveRightAnimation = keyframes`
  0% { transform: translateX(0); }
  50% { transform: translateX(5px); }
  100% { transform: translateX(0); }
`;

interface InstructionSectionProps {
  animate: boolean;
}

const InstructionSection = ({ animate }: InstructionSectionProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const stepDuration = 8000; // 一張圖片的播放時間
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();
  const router = useRouter();
  const controls = useAnimation();
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (animate) {
      controls.start("visible").then(() => setAnimationComplete(true));
    }
  }, [animate, controls]);

  useEffect(() => {
    if (animationComplete) {
      const currentStepData = steps[currentStep];
      setVideoProgress(0); // 重置進度條為 0

      const stepTimer = setTimeout(() => {
        setCurrentStep((prevStep) => (prevStep + 1) % steps.length);
      }, currentStepData.duration);

      const progressTimer = setInterval(() => {
        setVideoProgress((prevProgress) => {
          if (prevProgress < 100) {
            return prevProgress + 100 / (currentStepData.duration / 100);
          }
          return 100;
        });
      }, 100);

      return () => {
        clearTimeout(stepTimer);
        clearInterval(progressTimer);
      };
    }
  }, [animationComplete, currentStep]);

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setVideoProgress(0);
  };

  const calculateStepProgressHeight = () => {
    const validSteps = stepsRef.current.filter(
      (step): step is HTMLDivElement => step !== null
    );
    if (validSteps.length === 0) return "0%";

    const totalHeight = validSteps.reduce(
      (sum, step) => sum + step.offsetHeight,
      0
    );
    const completedHeight = validSteps
      .slice(0, currentStep + 1)
      .reduce((sum, step) => sum + step.offsetHeight, 0);

    return `${(completedHeight / totalHeight) * 100}%`;
  };

  const handleStartCreating = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      onOpen();
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.8,
      },
    },
  };

  const titleVariants = {
    hidden: {
      y: 20,
      opacity: 0.1,
      color: "#f9f9f8",
    },
    visible: {
      y: 0,
      opacity: 1,
      color: ["#f9f9f8", "#c7c8c8", "#c6332e"],
      transition: {
        y: { type: "spring", damping: 10, stiffness: 100, duration: 0.5 },
        opacity: { duration: 0.5 },
        color: {
          times: [0, 0.1, 1],
          duration: 1,
          ease: "easeInOut",
        },
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 1.8,
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <Box
      width="100%"
      minHeight="90vh"
      bg="brand.primary_light"
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={4}
      py={{ base: "100px", lg: "50px" }}
    >
      <MotionBox
        px={6}
        maxWidth="1300px"
        width="100%"
        height="100%"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <MotionFlex
          width="100%"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          justifyContent={{ base: "center", lg: "flex-end" }}
          pr={{ base: "0", lg: "30px" }}
        >
          {"HOW IT WORKS".split(" ").map((word, wordIndex) => (
            <React.Fragment key={wordIndex}>
              {wordIndex > 0 && (
                <Box as="span" width="0.6em" display="inline-block" />
              )}
              {word.split("").map((letter, letterIndex) => (
                <MotionText
                  key={`${wordIndex}-${letterIndex}`}
                  variants={titleVariants}
                  fontSize={{ base: "22px", md: "26px", lg: "30px" }}
                  fontWeight="300"
                  letterSpacing={6}
                  display="inline-block"
                >
                  {letter}
                </MotionText>
              ))}
            </React.Fragment>
          ))}
        </MotionFlex>
        <MotionFlex
          w="full"
          flexDirection={{ base: "column", lg: "row" }}
          position="relative"
          mt="50px"
          gap={10}
          justifyContent="center"
          alignItems="flex-start"
          variants={contentVariants}
        >
          <MotionBox
            w={{ base: "100%", lg: "65%" }}
            position="relative"
            display="flex"
            flexDirection="column"
            borderRadius="12px"
            boxShadow="lg"
            overflow="hidden"
          >
            <AspectRatio ratio={16 / 9} width="100%">
              <Box position="relative" bg="#ecebeb">
                <Image
                  priority
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  src={steps[currentStep].gifUrl}
                  alt={`Step ${currentStep + 1}`}
                  style={{ objectFit: "contain" }}
                />
              </Box>
            </AspectRatio>
            <Box
              w="100%"
              h="4px"
              bg="brand.light"
              overflow="hidden"
              borderRadius="full"
            >
              <Box
                w={`${videoProgress}%`}
                h="100%"
                bg="brand.primary"
                transition="width 0.1s linear"
              />
            </Box>
          </MotionBox>
          <MotionVStack
            w={{ base: "100%", lg: "34%" }}
            h="100%"
            spacing={8}
            py={2}
            alignItems="center"
            justifyContent="center"
          >
            <Flex
              w="100%"
              h="100%"
              position="relative"
              flexDirection="column"
              flex={1}
            >
              <Box
                w="2px"
                bg="brand.secondary"
                position="absolute"
                top="0"
                bottom="0"
                left="4px"
              />
              <Box
                w="2px"
                bg="brand.dark"
                position="absolute"
                top="0"
                left="4px"
                height={calculateStepProgressHeight()}
                transition="height 0.3s ease-in-out"
              />
              {steps.map((step, index) => (
                <Box
                  key={index}
                  ref={(el) => {
                    if (stepsRef.current) {
                      stepsRef.current[index] = el;
                    }
                  }}
                  cursor="pointer"
                  onClick={() => handleStepClick(index)}
                  color={
                    index === currentStep ? "brand.dark" : "brand.placeholder"
                  }
                  position="relative"
                  width="100%"
                  flex={index === currentStep ? "2" : "1"}
                  transition="all 0.3s ease-in-out"
                  pl={5}
                  pt={4}
                  pb={index === currentStep ? 4 : 2}
                >
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    width="10px"
                    height="10px"
                    borderRadius="50%"
                    bg={index <= currentStep ? "brand.dark" : "brand.secondary"}
                    transition="background-color 0.3s"
                  />
                  <Flex
                    alignItems="center"
                    transition="color 0.2s, transform 0.2s"
                    _hover={{
                      color: "brand.dark",
                      fontWeight: "700",
                      transform: "translateX(10px)",
                    }}
                  >
                    <Box
                      as="span"
                      fontSize={{ base: "10px", md: "12px", lg: "13px" }}
                      fontWeight="400"
                      fontStyle="italic"
                      mr={3}
                      px={2}
                      py={1}
                      borderRadius="md"
                      bg={index === currentStep ? "brand.dark" : "transparent"}
                      color={
                        index === currentStep ? "#ffffff" : "brand.secondary"
                      }
                      transition="background-color 0.3s"
                    >
                      STEP {index + 1}
                    </Box>
                    <Heading
                      as="h3"
                      fontWeight={index === currentStep ? "600" : "500"}
                      fontSize={{ base: "18px", md: "20px", lg: "23px" }}
                      mb={0}
                    >
                      {step.title}
                    </Heading>
                  </Flex>
                  <Text
                    fontSize={{ base: "14px", md: "15px" }}
                    opacity={index === currentStep ? 1 : 0}
                    maxHeight={index === currentStep ? "1000px" : "0"}
                    overflow="hidden"
                    transition="all 0.3s ease-in-out"
                    pr={{ base: "20px", lg: "0" }}
                    pl={{ base: "60px", md: "70px", lg: "70px" }}
                    mt={2}
                  >
                    {step.description}
                  </Text>
                </Box>
              ))}
            </Flex>
            <Show above="lg">
              <Box flex="1.5"></Box>
            </Show>
            <Show above="lg">
              <MotionBox
                position="absolute"
                bottom={{ base: "0px", lg: "-10px" }}
                right="0"
                w="220px"
                flex={1}
              >
                <Button
                  py="22px"
                  bg="brand.primary"
                  color="white"
                  rounded="md"
                  width="100%"
                  borderRadius="30px"
                  _hover={{
                    bg: "brand.hover",
                    color: "#ffffff",
                  }}
                  onClick={handleStartCreating}
                >
                  開始創作{" "}
                  <Box
                    as="span"
                    display="inline-block"
                    animation={`${moveRightAnimation} 1s infinite`}
                    ml={2}
                  >
                    →
                  </Box>
                </Button>
              </MotionBox>
            </Show>
            <Show below="lg">
              <MotionBox
                flex={1}
                width={{ base: "40%", md: "35%" }}
                alignSelf="center"
                mt="35px"
              >
                <Button
                  px={4}
                  py={5}
                  bg="brand.primary"
                  color="white"
                  rounded="md"
                  width="100%"
                  size={{ base: "xs", md: "sm" }}
                  borderRadius="30px"
                  _hover={{
                    bg: "brand.hover",
                    color: "#ffffff",
                  }}
                  onClick={handleStartCreating}
                >
                  開始創作 →
                </Button>
              </MotionBox>
            </Show>
          </MotionVStack>
        </MotionFlex>
      </MotionBox>
      <AuthModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default InstructionSection;