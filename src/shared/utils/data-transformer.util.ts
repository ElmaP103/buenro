export class DataTransformer {
  static transformSource1(data: any) {
    return {
      id: data.id,
      name: data.name,
      city: data.address.city,
      country: data.address.country,
      isAvailable: data.isAvailable,
      pricePerNight: Number(data.priceForNight),
      source: 'source1',
    };
  }

  static transformSource2(data: any) {
    return {
      id: data.id,
      city: data.city,
      isAvailable: data.availability,
      pricePerNight: Number(data.pricePerNight),
      priceSegment: data.priceSegment,
      source: 'source2',
    };
  }

  static determineSource(data: any): 'source1' | 'source2' {
    if ('address' in data && 'priceForNight' in data) {
      return 'source1';
    }
    if ('availability' in data && 'priceSegment' in data) {
      return 'source2';
    }
    throw new Error('Unknown data source format');
  }
} 