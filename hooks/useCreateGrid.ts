import { useCallback } from "react";
import { fabric } from "fabric";
import { MAIN_GRID_SIZE, SUB_GRID_SIZE, MAX_ZOOM } from "@/types/DesignType";

interface UseCreateGridProps {
  color: {
    canvas: {
      mainGridColor: string;
      subGridColor: string;
    };
  };
}

const useCreateGrid = ({ color }: UseCreateGridProps) => {
  const createGrid = useCallback(
    (width: number, height: number) => {
      const canvasWidth = width;
      const canvasHeight = height;

      const maxGridWidth = canvasWidth * MAX_ZOOM;
      const maxGridHeight = canvasHeight * MAX_ZOOM;

      const gridLines = [];

      // 確保網格線從0開始，並向兩側延伸
      const startX =
        -Math.floor(maxGridWidth / 2 / MAIN_GRID_SIZE) * MAIN_GRID_SIZE;
      const startY =
        -Math.floor(maxGridHeight / 2 / MAIN_GRID_SIZE) * MAIN_GRID_SIZE;
      const endX =
        Math.ceil(maxGridWidth / 2 / MAIN_GRID_SIZE) * MAIN_GRID_SIZE;
      const endY =
        Math.ceil(maxGridHeight / 2 / MAIN_GRID_SIZE) * MAIN_GRID_SIZE;

      //繪製次網格線
      //垂直線
      for (let i = startX; i <= endX; i += SUB_GRID_SIZE) {
        const vLine = new fabric.Line([i, -maxGridHeight, i, maxGridHeight], {
          stroke: color.canvas.subGridColor,
          selectable: false,
          strokeUniform: true,
          strokeWidth: 1,
          opacity: 0.7,
        });
        gridLines.push(vLine);
      }
      //水平線
      for (let i = startY; i <= endY; i += SUB_GRID_SIZE) {
        const hLine = new fabric.Line([-maxGridWidth, i, maxGridWidth, i], {
          stroke: color.canvas.subGridColor,
          selectable: false,
          strokeUniform: true,
          strokeWidth: 1,
          opacity: 0.7,
        });
        gridLines.push(hLine);
      }

      //繪製主網格線
      //垂直線
      for (let i = startX; i <= endX; i += MAIN_GRID_SIZE) {
        const vLine = new fabric.Line([i, -maxGridHeight, i, maxGridHeight], {
          stroke: color.canvas.mainGridColor,
          selectable: false,
          strokeUniform: true,
          strokeWidth: 1.5,
          opacity: 0.7,
        });
        gridLines.push(vLine);
      }

      //水平線
      for (let i = startY; i <= endY; i += MAIN_GRID_SIZE) {
        const hLine = new fabric.Line([-maxGridWidth, i, maxGridWidth, i], {
          stroke: color.canvas.mainGridColor,
          selectable: false,
          strokeUniform: true,
          strokeWidth: 1.5,
          opacity: 0.7,
        });
        gridLines.push(hLine);
      }

      // 添加中央 X 軸線
      gridLines.push(
        new fabric.Line([startX, 0, endX, 0], {
          stroke: color.canvas.mainGridColor,
          selectable: false,
          strokeUniform: true,
          strokeWidth: 2.3,
          opacity: 1,
        })
      );

      // 添加中央 Y 軸線
      gridLines.push(
        new fabric.Line([0, startY, 0, endY], {
          stroke: color.canvas.mainGridColor,
          selectable: false,
          strokeUniform: true,
          strokeWidth: 2.3,
          opacity: 1,
        })
      );

      //將網格組成群組
      const gridGroup = new fabric.Group(gridLines, {
        name: "designGrid", // 給網格一個唯一的名字
        selectable: false, //禁用選擇
        evented: false, ///禁用事件
        objectCaching: false, //禁用緩存，增加清晰度
        originX: "center",
        originY: "center",
        left: 0,
        top: 0,
      });

      return gridGroup;
    },
    [color.canvas.subGridColor, color.canvas.mainGridColor]
  );

  return createGrid;
};

export default useCreateGrid;
