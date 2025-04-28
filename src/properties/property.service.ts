import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { S3Service } from '../shared/services/s3.service';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Property } from './schemas/property.schema';
import { PropertyRepository } from './repositories/property.repository';

@Injectable()
export class PropertyService {
  private readonly logger = new Logger(PropertyService.name);

  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  @Cron('0 */6 * * *', { name: 'data-ingestion' })
  async scheduledIngest() {
    this.logger.log('Starting scheduled data ingestion');
    try {
      await this.ingestData();
      this.logger.log('Scheduled data ingestion completed successfully');
    } catch (error) {
      this.logger.error(`Scheduled data ingestion failed: ${error.message}`);
      throw new InternalServerErrorException('Failed to perform scheduled data ingestion');
    }
  }

  async ingestData(): Promise<void> {
    try {
      const bucket = this.configService.get<string>('s3.bucket');
      const source1Key = this.configService.get<string>('s3.source1Key');
      const source2Key = this.configService.get<string>('s3.source2Key');

      if (!bucket || !source1Key || !source2Key) {
        throw new Error('Missing required S3 configuration');
      }

      // Fetch data from both sources
      const source1Data = await this.s3Service.getObject(bucket, source1Key);
      const source2Data = await this.s3Service.getObject(bucket, source2Key);

      // Process data from both sources
      const processedSource1Data = await this.s3Service.processSource1(source1Data);
      const processedSource2Data = await this.s3Service.processSource2(source2Data);

      // Combine data from both sources
      const combinedData = [...processedSource1Data, ...processedSource2Data];

      // Clear existing data
      await this.propertyRepository.deleteAll();

      // Insert new data
      await this.propertyRepository.insertMany(combinedData);

      this.logger.log(`Data ingestion completed successfully. Ingested ${combinedData.length} properties.`);
    } catch (error) {
      this.logger.error(`Error during data ingestion: ${error.message}`);
      throw new InternalServerErrorException('Failed to ingest property data');
    }
  }

  async findAll(filters: any = {}, page = 1, limit = 10): Promise<{ data: Property[]; total: number }> {
    try {
      const query: any = {};

      if (filters.city) {
        query.city = { $regex: filters.city, $options: 'i' };
      }

      if (filters.country) {
        query.country = { $regex: filters.country, $options: 'i' };
      }

      if (filters.isAvailable !== undefined) {
        query.isAvailable = filters.isAvailable;
      }

      if (filters.minPrice || filters.maxPrice) {
        query.pricePerNight = {};
        if (filters.minPrice) {
          query.pricePerNight.$gte = Number(filters.minPrice);
        }
        if (filters.maxPrice) {
          query.pricePerNight.$lte = Number(filters.maxPrice);
        }
      }

      if (filters.priceSegment) {
        query.priceSegment = filters.priceSegment;
      }

      if (filters.source) {
        query.source = filters.source;
      }

      const skip = (page - 1) * limit;
      
      return await this.propertyRepository.findAll(query, skip, limit);
    } catch (error) {
      this.logger.error(`Error fetching properties: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch properties');
    }
  }

  async initializeData(): Promise<void> {
    try {
      // Check if data already exists
      const count = await this.propertyRepository.count();
      if (count === 0) {
        this.logger.log('No data found. Starting initial data ingestion...');
        await this.ingestData();
      } else {
        this.logger.log(`Database already contains ${count} properties. Skipping initial ingestion.`);
      }
    } catch (error) {
      this.logger.error(`Error during initialization: ${error.message}`);
      throw new InternalServerErrorException('Failed to initialize property data');
    }
  }
} 