# Property Data Ingestion Service

A NestJS-based backend service for ingesting and querying property data from multiple sources.

## Features

- Ingest data from multiple S3 JSON sources
- Unified data model for different source formats
- Flexible filtering capabilities with pagination
- MongoDB-based storage with optimized indexes
- Scalable architecture with dependency injection
- Scheduled data ingestion with configurable intervals
- Comprehensive API documentation with Swagger
- Automatic data ingestion on application startup

## Performance Considerations

Several optimizations have been implemented:

- **Database Indexing**: Compound indexes on frequently queried fields
- **Pagination**: Limit result sets to prevent memory issues
- **Efficient Queries**: Case-insensitive text search with regex
- **Bulk Operations**: Use of insertMany for efficient data ingestion
- **Error Handling**: Graceful handling of partial failures

## Filtering Capabilities

The API supports flexible filtering across all attributes:

- **Text Search**: Case-insensitive partial matching for city and country
- **Numeric Ranges**: Min/max price filtering
- **Boolean Filters**: Availability status
- **Categorical Filters**: Price segment and data source
- **Pagination**: Page-based navigation with configurable page size

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- AWS credentials with S3 access

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/property-db
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key(optional)
AWS_REGION=your_region(optional)
S3_BUCKET=your_bucket_name
S3_SOURCE1_KEY=path/to/source1.json
S3_SOURCE2_KEY=path/to/source2.json
```

3. Start MongoDB locally or update the MONGODB_URI to point to your MongoDB instance.

## Running the Application

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

### Automatic Data Ingestion

The application automatically ingests data from the configured S3 sources when it starts up. This happens through the `initializeData` method in the `AppModule`, which checks if data already exists in the database:

- If the database is empty, it triggers the data ingestion process
- If data already exists, it logs the count and skips ingestion

This ensures that your application always has data available for querying without requiring manual intervention.

## API Endpoints

### Ingest Data
```
POST /properties/ingest
```
Triggers the data ingestion process from S3 sources. This endpoint is useful for manually refreshing the data or after adding a new data source.

### Query Properties
```
GET /properties?city=London&country=UK&isAvailable=true&minPrice=100&maxPrice=500&priceSegment=medium&source=source1&page=1&limit=10
```

Query Parameters:
- `city`: Filter by city name (case-insensitive partial match)
- `country`: Filter by country name (case-insensitive partial match)
- `isAvailable`: Filter by availability (true/false)
- `minPrice`: Minimum price per night
- `maxPrice`: Maximum price per night
- `priceSegment`: Filter by price segment (budget/mid-range/luxury)
- `source`: Filter by data source (source1/source2)
- `page`: Page number for pagination (default: 1)
- `limit`: Number of items per page (default: 10)

## Extending the Solution

To add support for new data sources:

1. Create a new processing method in `S3Service`:

async processSource3(data: any[]): Promise<any[]> {
  return data.map(item => ({
    // Map the new source's fields to the unified model
    id: item.id,
    name: item.name,
    city: item.city,
    country: item.country,
    isAvailable: item.isAvailable,
    pricePerNight: item.pricePerNight,
    priceSegment: this.calculatePriceSegment(item.pricePerNight),
    source: 'source3',
  }));
}
```

2. Update the `ingestData` method in `PropertyService` to 
async ingestData(): Promise<void> {
  try {
    // ... existing code ...
    
    // Add new source
    const source3Key = this.configService.get<string>('s3.source3Key');
    const source3Data = await this.s3Service.getObject(bucket, source3Key);
    const processedSource3Data = await this.s3Service.processSource3(source3Data);
    
    // Combine data from all sources
    const combinedData = [...processedSource1Data, ...processedSource2Data, ...processedSource3Data];
    
    // Clear existing data and insert new data
    await this.propertyRepository.deleteAll();
    await this.propertyRepository.insertMany(combinedData);
  } catch (error) {
    this.logger.error(`Error during data ingestion: ${error.message}`);
    throw new InternalServerErrorException('Failed to ingest property data');
  }
}
```

3. Update the configuration in `.env`:
```
S3_SOURCE3_KEY=path/to/source3.json
```

4. Restart the application to trigger the automatic data ingestion with the new source.

## Future Improvements

- Implement caching for frequently accessed data
- Add cursor-based pagination for large datasets
- Create interfaces for services and repositories
- Add comprehensive unit and integration tests
- Implement a more generic data ingestion strategy with a factory pattern
- Add data validation using class-validator and class-transformer
- Implement rate limiting for API endpoints
