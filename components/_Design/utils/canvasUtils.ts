import * as fabric from "fabric";

//計算縮放比例
export const calculateZoom = (
  currentZoom: number,
  delta: number,
  minZoom: number,
  maxZoom: number
) => {
  let newZoom = currentZoom * 0.999 ** delta;

  //要限制 minZoom 和 maxZoom的值，以確保縮放範圍在合理範圍內
  return Math.min(Math.max(minZoom, newZoom), maxZoom);
};

export const calculatePan = (
  vpt: number[],
  dx: number,
  dy: number,
  zoom: number,
  canvasWidth: number,
  canvasHeight: number
) => {
  // 計算最大允許的平移距離
  const maxPanX = canvasWidth / zoom / 2;
  const maxPanY = canvasHeight / zoom / 2;

  // 限制平移範圍
  const newX = Math.min(Math.max(vpt[4] + dx, -maxPanX * zoom), maxPanX * zoom);
  const newY = Math.min(Math.max(vpt[5] + dy, -maxPanY * zoom), maxPanY * zoom);

  return { x: newX, y: newY };
};
