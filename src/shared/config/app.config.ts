export default () => ({
  port: parseInt(process.env.PORT as string, 10) || 3000,
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/property-db',
  },
  aws: {
    region: process.env.AWS_REGION || 'eu-north-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  s3: {
    bucket: process.env.S3_BUCKET || 'buenro-tech-assessment-materials',
    source1Key: process.env.S3_SOURCE1_KEY || 'structured_generated_data.json',
    source2Key: process.env.S3_SOURCE2_KEY || 'large_generated_data.json',
  },
  ingestion: {
    cronSchedule: process.env.INGESTION_CRON || '0 */6 * * *', // Every 6 hours by default
  },
}); 