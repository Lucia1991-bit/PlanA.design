// import { fabric } from "fabric";

// export const createOrUpdateSelectionOverlay = (
//   canvas: fabric.Canvas,
//   room: fabric.Polygon
// ) => {
//   removeSelectionOverlay(canvas, room.id);

//   const points = room.get("points") as fabric.Point[];
//   const overlay = new fabric.Polygon(points, {
//     fill: "rgba(0, 123, 255, 0.3)",
//     stroke: "#3b82f6",
//     strokeWidth: 2,
//     selectable: false,
//     evented: false,
//     objectCaching: false,
//     name: "roomSelectionOverlay",
//     excludeFromExport: true,
//     data: { roomId: room.id },
//   });

//   canvas.add(overlay);
//   overlay.moveTo(canvas.getObjects().indexOf(room) + 1);
//   canvas.renderAll();
//   return overlay;
// };

// export const removeSelectionOverlay = (
//   canvas: fabric.Canvas,
//   roomId: string
// ) => {
//   const overlay = canvas
//     .getObjects()
//     .find(
//       (obj) =>
//         obj.name === "roomSelectionOverlay" && obj.data?.roomId === roomId
//     );
//   if (overlay) {
//     canvas.remove(overlay);
//     canvas.renderAll();
//   }
// };

// export const setupRoomEvents = (canvas: fabric.Canvas, room: fabric.Object) => {
//   let selectionOverlay: fabric.Polygon | null = null;

//   room.on("selected", () => {
//     selectionOverlay = createOrUpdateSelectionOverlay(
//       canvas,
//       room as fabric.Polygon
//     );
//     canvas.renderAll();
//   });

//   room.on("deselected", () => {
//     if (selectionOverlay) {
//       canvas.remove(selectionOverlay);
//       selectionOverlay = null;
//       canvas.renderAll();
//     }
//   });
// };
