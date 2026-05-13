export interface MachineryMedia {
  id: number;
  url: string;
  publicId: string;
  mediaType: 'image' | 'video';
  isPrimary: boolean;
}

export interface Machinery {
  id: number;
  name: string;
  price: number;
  image: string;
  condition: string;
  quantity: number;
  category: string;
  description: string;
  media: MachineryMedia[];
}
