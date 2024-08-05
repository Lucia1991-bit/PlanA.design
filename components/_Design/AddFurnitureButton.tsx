import React from "react";
import { Button } from "@chakra-ui/react";
import useCanvasStore from "@/stores/useCanvasStore";
import { Image, Circle } from "fabric";

//整體縮放比例
const GLOBAL_SCALE = 0.4;

const AddFurnitureButton: React.FC = () => {
  const addObject = useCanvasStore((state) => state.addObject);
  const canvas = useCanvasStore((state) => state.canvas);

  const handleAddImage = () => {
    Image.fromURL("/furniture/單人沙發Ｗ80D85-1.png", {
      crossOrigin: "anonymous",
    })
      .then((img) => {
        //套用比例系統
        img.scale(GLOBAL_SCALE);

        img.objectCaching = false;

        // 設置圖片到畫布中心
        if (canvas) {
          img.set({
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: "center",
            originY: "center",
          });
        }
        addObject(img);
      })
      .catch((error) => {
        console.error("Error loading image:", error);
      });
  };

  const handleAddImage2 = () => {
    Image.fromURL("/furniture/四人沙發Ｗ230D105.png", {
      crossOrigin: "anonymous",
      objectCaching: false,
    })
      .then((img) => {
        img.scale(GLOBAL_SCALE);

        // 設置圖片到畫布中心
        if (canvas) {
          img.set({
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: "center",
            originY: "center",
          });
        }
        addObject(img);
      })
      .catch((error) => {
        console.error("Error loading image:", error);
      });
  };

  const handleAddCircle = () => {
    const circle = new Circle({
      radius: 50,
      fill: "red",
      left: 100,
      top: 100,
    });
    addObject(circle);
  };

  return (
    <>
      <Button onClick={handleAddImage}>我是家具圖片1</Button>
      <Button onClick={handleAddImage2}>我是家具圖片2</Button>
    </>
  );
};

export default AddFurnitureButton;
