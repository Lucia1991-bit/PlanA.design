export const CATEGORIES = ["石材", "木地板", "磁磚", "戶外"];

export interface MaterialType {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  small_imageUrl: string;
}
