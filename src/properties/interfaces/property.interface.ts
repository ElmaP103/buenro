export interface IProperty {
  id: string | number;
  name?: string;
  city: string;
  country?: string;
  isAvailable: boolean;
  pricePerNight: number;
  priceSegment?: 'high' | 'medium' | 'low';
  source: string;
  createdAt: Date;
  updatedAt: Date;
} 