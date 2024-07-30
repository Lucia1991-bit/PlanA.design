import { Card, CardBody, Skeleton, SkeletonText } from "@chakra-ui/react";
import React from "react";

const BoardSkeleton = () => {
  return (
    <Card borderRadius="6px" width="100%" height="100%">
      <Skeleton
        height="300px"
        startColor="brand.light"
        endColor="brand.third"
      />
      <CardBody>
        <SkeletonText
          noOfLines={2}
          skeletonHeight="4"
          startColor="brand.light"
          endColor="brand.third"
        />
      </CardBody>
    </Card>
  );
};

export default BoardSkeleton;
