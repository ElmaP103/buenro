import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { S3Service } from '../shared/services/s3.service';
import { Property, PropertySchema } from './schemas/property.schema';
import { PropertyRepository } from './repositories/property.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Property.name, schema: PropertySchema }]),
    ScheduleModule.forRoot(),
    ConfigModule,
  ],
  controllers: [PropertyController],
  providers: [PropertyService, PropertyRepository, S3Service],
  exports: [PropertyService],
})
export class PropertiesModule {} 