import React from "react";
import { Button } from "@chakra-ui/react";
import useCanvasStore from "@/stores/useCanvasStore";
import { fabric } from "fabric";

//整體縮放比例
const GLOBAL_SCALE = 0.4;

const AddFurnitureButton: React.FC = () => {
  const addObject = useCanvasStore((state) => state.addObject);
  const canvas = useCanvasStore((state) => state.canvas);

  const handleAddImage = () => {
    fabric.Image.fromURL(
      "/furniture/單人沙發Ｗ80D85-1.png",
      (img) => {
        //套用比例系統
        img.scale(GLOBAL_SCALE);

        img.objectCaching = false;

        // 設置圖片到畫布中心
        if (canvas) {
          img.set({
            left: canvas.getWidth() / 2,
            top: canvas.getHeight() / 2,
            originX: "center",
            originY: "center",
          });
        }
        addObject(img);
      },
      { crossOrigin: "anonymous" }
    );
  };

  const handleAddImage2 = () => {
    fabric.Image.fromURL(
      "/furniture/四人沙發Ｗ230D105.png",
      (img) => {
        img.scale(GLOBAL_SCALE);

        img.objectCaching = false;

        // 設置圖片到畫布中心
        if (canvas) {
          img.set({
            left: canvas.getWidth() / 2,
            top: canvas.getHeight() / 2,
            originX: "center",
            originY: "center",
          });
        }
        addObject(img);
      },
      { crossOrigin: "anonymous" }
    );
  };

  const handleAddCircle = () => {
    const circle = new fabric.Circle({
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
