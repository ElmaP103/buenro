import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property } from '../schemas/property.schema';

@Injectable()
export class PropertyRepository {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
  ) {}

  async findAll(query: any, skip: number, limit: number): Promise<{ data: Property[]; total: number }> {
    const [data, total] = await Promise.all([
      this.propertyModel.find(query).skip(skip).limit(limit).exec(),
      this.propertyModel.countDocuments(query).exec(),
    ]);
    
    return { data, total };
  }

  async deleteAll(): Promise<void> {
    await this.propertyModel.deleteMany({});
  }

  async insertMany(properties: any[]): Promise<void> {
    await this.propertyModel.insertMany(properties);
  }

  async count(): Promise<number> {
    return this.propertyModel.countDocuments().exec();
  }
} 