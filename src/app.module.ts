import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { PropertiesModule } from './properties/properties.module';
import { HomeController } from './home.controller';
import configuration from './shared/config/app.config';
import { PropertyService } from './properties/property.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    PropertiesModule,
  ],
  controllers: [HomeController],
})
export class AppModule {
  async initializeData(propertyService: PropertyService) {
    await propertyService.initializeData();
  }
}
