export const ROOM_CATEGORIES = ["客廳", "房間", "餐廳", "浴室", "家飾"];

export const FURNITURE_CATEGORIES = ["沙發", "桌子", "櫥櫃", "床", "其他"];

export interface FurnitureType {
  id: string;
  name: string;
  category: string;
  room_category: string;
  imageUrl: string;
  thumbnailUrl: string;
  size: string;
}
