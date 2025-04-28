import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { PropertyService } from './properties/property.service';

@ApiTags('Home')
@Controller()
export class HomeController {
  constructor(
    @InjectConnection() private connection: Connection,
    private propertyService: PropertyService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Root endpoint' })
  getHome(): { message: string; status: string } {
    return {
      message: 'Welcome to Property Data Ingestion Service',
      status: 'running'
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  getHealth(): { status: string } {
    return {
      status: 'ok'
    };
  }

  @Get('db-health')
  @ApiOperation({ summary: 'Database health check' })
  async getDbHealth(): Promise<{ status: string; details: any }> {
    try {
      if (!this.connection?.db) {
        throw new Error('Database connection not established');
      }

      const dbStatus = await this.connection.db.admin().ping();
      const collections = await this.connection.db.listCollections().toArray();
      
      return {
        status: 'connected',
        details: {
          database: this.connection.db.databaseName || 'unknown',
          collections: collections.map(col => col.name),
          ping: dbStatus
        }
      };
    } catch (error) {
      return {
        status: 'disconnected',
        details: {
          error: error.message
        }
      };
    }
  }

  @Post('ingest')
  @ApiOperation({ summary: 'Manually trigger data ingestion' })
  async triggerIngestion(): Promise<{ message: string; status: string }> {
    try {
      await this.propertyService.ingestData();
      return {
        message: 'Data ingestion completed successfully',
        status: 'success'
      };
    } catch (error) {
      return {
        message: `Data ingestion failed: ${error.message}`,
        status: 'error'
      };
    }
  }
} 