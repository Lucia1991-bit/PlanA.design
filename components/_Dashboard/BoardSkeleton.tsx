import { Card, CardBody, Skeleton, SkeletonText } from "@chakra-ui/react";

const BoardSkeleton = () => {
  return (
    <Card
      borderRadius="10px"
      display="flex"
      flexDir="column"
      width="100%"
      height="100%"
      overflow="hidden"
    >
      <Skeleton
        width="100%"
        pt="75%"
        startColor="brand.secondary"
        endColor="brand.light"
        flex="1"
        borderRadius={0}
      />
      <CardBody
        height="65px"
        maxHeight="70px"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        px="50px"
      >
        <SkeletonText
          noOfLines={2}
          skeletonHeight="3"
          startColor="brand.secondary"
          endColor="brand.light"
        />
      </CardBody>
    </Card>
  );
};

export default BoardSkeleton;
