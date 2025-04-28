import { Controller, Get, Query, Post, UsePipes, ValidationPipe, HttpStatus, Logger, InternalServerErrorException } from '@nestjs/common';
import { PropertyService } from './property.service';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Property } from './schemas/property.schema';

@ApiTags('properties')
@Controller('properties')
export class PropertyController {
  private readonly logger = new Logger(PropertyController.name);

  constructor(private readonly propertyService: PropertyService) {}

  @Post('ingest')
  async ingestData() {
    await this.propertyService.ingestData();
    return {
      statusCode: HttpStatus.OK,
      message: 'Data ingestion completed successfully',
      data: (await this.propertyService.findAll()).data
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all properties with optional filtering and pagination' })
  @ApiQuery({ name: 'city', required: false, description: 'Filter by city (case-insensitive partial match)' })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country (case-insensitive partial match)' })
  @ApiQuery({ name: 'isAvailable', required: false, description: 'Filter by availability status' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Minimum price per night' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Maximum price per night' })
  @ApiQuery({ name: 'priceSegment', required: false, description: 'Filter by price segment (budget, mid-range, luxury)' })
  @ApiQuery({ name: 'source', required: false, description: 'Filter by data source' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page (default: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns a list of properties and total count',
    type: Property,
    isArray: true
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('isAvailable') isAvailable?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('priceSegment') priceSegment?: string,
    @Query('source') source?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{ data: Property[]; total: number }> {
    try {
      const filters = {
        city,
        country,
        isAvailable: isAvailable ? isAvailable.toLowerCase() === 'true' : undefined,
        minPrice,
        maxPrice,
        priceSegment,
        source,
      };

      return await this.propertyService.findAll(filters, Number(page), Number(limit));
    } catch (error) {
      this.logger.error(`Error in findAll: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch properties');
    }
  }
} 