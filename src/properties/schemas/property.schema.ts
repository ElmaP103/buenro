import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PropertyDocument = Property & Document;

@Schema({ timestamps: true })
export class Property {
  @Prop({ required: true, type: String })
  id: string;

  @Prop()
  name: string;

  @Prop({ required: true, index: true })
  city: string;

  @Prop()
  country: string;

  @Prop({ required: true, index: true })
  isAvailable: boolean;

  @Prop({ required: true, index: true })
  pricePerNight: number;

  @Prop({ enum: ['high', 'medium', 'low'] })
  priceSegment: string;

  @Prop({ required: true })
  source: string;
}

export const PropertySchema = SchemaFactory.createForClass(Property);

// Create compound indexes for common query patterns
PropertySchema.index({ city: 1, isAvailable: 1 });
PropertySchema.index({ pricePerNight: 1, isAvailable: 1 });
PropertySchema.index({ country: 1, city: 1 }); 