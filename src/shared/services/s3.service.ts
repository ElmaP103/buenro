import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('aws.region');
    const bucket = this.configService.get<string>('s3.bucket');
    
    if (!region || !bucket) {
      throw new Error('Missing required AWS configuration');
    }
    
    this.baseUrl = `https://${bucket}.s3.${region}.amazonaws.com`;
  }

  async getObject(bucket: string, key: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/${key}`;
      this.logger.log(`Fetching data from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText} (${response.status})`);
      }
      
      const data = await response.json();
      this.logger.log(`Successfully fetched data from ${key}, found ${Array.isArray(data) ? data.length : 'non-array'} items`);
      
      return data;
    } catch (error) {
      this.logger.error(`Error fetching data from ${key}: ${error.message}`);
      throw error;
    }
  }

  async processSource1(data: any[]): Promise<any[]> {
    if (!Array.isArray(data)) {
      throw new Error('Source1 data is not an array');
    }
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      city: item.address?.city,
      country: item.address?.country,
      isAvailable: item.isAvailable,
      pricePerNight: Number(item.priceForNight),
      source: 'source1',
    }));
  }

  async processSource2(data: any[]): Promise<any[]> {
    if (!Array.isArray(data)) {
      throw new Error('Source2 data is not an array');
    }
    
    return data.map(item => ({
      id: item.id,
      city: item.city,
      isAvailable: item.availability,
      pricePerNight: Number(item.pricePerNight),
      priceSegment: item.priceSegment,
      source: 'source2',
    }));
  }
} 