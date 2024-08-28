import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  useColorModeValue,
  VStack,
  AspectRatio,
  Show,
  useDisclosure,
  keyframes,
} from "@chakra-ui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/_Auth/AuthModal";

const steps = [
  {
    title: "繪製空間",
    description: "使用繪製工具繪製牆體，",
    gifUrl: "/內容假圖.png",
  },
  {
    title: "填入材質",
    description: "為您的空間添加家具、裝飾品和材質。",
    gifUrl: "/內容假圖.png",
  },
  {
    title: "選擇家具",
    description: "效果逼真的圖片、全景圖、VR漫遊，甚至是帶有動效的視頻！",
    gifUrl: "/內容假圖.png",
  },
  {
    title: "分享圖面",
    description: "無需負擔你的電腦，隨時隨地在任何瀏覽器上訪問或分享你的設計。",
    gifUrl: "/內容假圖.png",
  },
];

const moveRightAnimation = keyframes`
  0% { transform: translateX(0); }
  50% { transform: translateX(5px); }
  100% { transform: translateX(0); }
`;

const InstructionSection = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const stepDuration = 5000; // 一張圖片的播放時間
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep + 1) % steps.length);
      setVideoProgress(0);
    }, stepDuration);

    const progressTimer = setInterval(() => {
      setVideoProgress((prevProgress) => {
        if (prevProgress < 100) {
          return prevProgress + 1;
        }
        return prevProgress;
      });
    }, stepDuration / 100);

    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
    };
  }, []);

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
      <Box p={8} maxWidth="1300px" width="100%" height="100%">
        <Text
          color="brand.primary"
          fontSize={{ base: "20px", md: "26px", lg: "30px" }}
          fontWeight="300"
          letterSpacing={6}
          textAlign={{ base: "center", lg: "right" }}
          pr={{ base: "0", lg: "30px" }}
        >
          HOW IT WORKS
        </Text>
        <Flex
          w="full"
          flexDirection={{ base: "column", lg: "row" }}
          position="relative"
          mt="50px"
          gap={10}
          justifyContent="center"
          alignItems="flex-start"
        >
          <Box
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
          </Box>
          <VStack
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
                    fontSize={{ base: "xs", lg: "sm" }}
                    opacity={index === currentStep ? 1 : 0}
                    maxHeight={index === currentStep ? "1000px" : "0"}
                    overflow="hidden"
                    transition="all 0.3s ease-in-out"
                    pr="5px"
                    pl={{ base: "60px", md: "70px", lg: "70px" }}
                    mt={2}
                  >
                    {step.description}
                  </Text>
                </Box>
              ))}
            </Flex>

            <Show above="lg">
              <Box flex={1}></Box>
            </Show>
            <Show below="lg">
              <Box flex={1} width="40%" alignSelf="center" mt="35px">
                <Button
                  px={4}
                  py={5}
                  bg="brand.primary"
                  color="white"
                  rounded="md"
                  width="100%"
                  size={{ base: "xs", md: "sm" }}
                  borderRadius="30px"
                  onClick={handleStartCreating}
                >
                  開始創作 →
                </Button>
              </Box>
            </Show>
          </VStack>
          <Show above="lg">
            <Box position="absolute" bottom="0" right="0" w="220px" flex={1}>
              <Button
                p={4}
                size="md"
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
            </Box>
          </Show>
        </Flex>
      </Box>
      <AuthModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default InstructionSection;
