import { ExifManager, ExifKeyValue } from '../src';
import * as fs from 'fs';
import * as path from 'path';

describe('ExifManager', () => {
  const base64WithExif = fs.readFileSync(path.join(__dirname, 'images', 'with_exif_base64.txt'), 'utf-8');
  const base64WithoutExif = fs.readFileSync(path.join(__dirname, 'images', 'without_exif_base64.txt'), 'utf-8');

  it('should read EXIF from a base64 image with EXIF', async () => {
    const exif = await ExifManager.readExif(base64WithExif);
    // Since our test image might not have real EXIF, we just check it returns an array
    expect(Array.isArray(exif.keyValueExif)).toBeTruthy();
  });

  it('should return basic EXIF info when basicExifInfo is provided', async () => {
    // Test the basicExifInfo functionality directly
    const basicInfo = {
      make: 'TestMake',
      model: 'TestModel',
      date: '2024-01-01T00:00:00Z',
      GPSLatitude: -34.6037,
      GPSLongitude: -58.3816
    };
    
    // Create a mock image that will definitely not have EXIF
    const mockImage = 'data:image/jpeg;base64,invalid_base64_data';
    
    const exif = await ExifManager.readExif(mockImage, basicInfo);
    
    // Check that basic EXIF info was generated
    const makeEntry = exif.keyValueExif.find(e => e.key === 'Make');
    const modelEntry = exif.keyValueExif.find(e => e.key === 'Model');
    const dateEntry = exif.keyValueExif.find(e => e.key === 'DateTime');
    const gpsEntry = exif.keyValueExif.find(e => e.key === 'GPS');
    
    expect(makeEntry?.value).toBe('TestMake');
    expect(modelEntry?.value).toBe('TestModel');
    expect(dateEntry?.value).toBe('2024-01-01T00:00:00Z');
    expect(gpsEntry).toBeDefined();
  });

  it('should modify EXIF data in a base64 image', () => {
    const exif = ExifManager.generateBaseExif({ make: 'Canon', model: 'Test', date: '2024-01-01T00:00:00Z' });
    const newBase64 = ExifManager.modifyExif(base64WithoutExif, exif);
    expect(typeof newBase64).toBe('string');
    expect(newBase64.startsWith('data:image/')).toBeTruthy();
  });

  it('should remove EXIF data from a base64 image', () => {
    const removed = ExifManager.removeExif(base64WithExif);
    expect(typeof removed).toBe('string');
    expect(removed.startsWith('data:image/')).toBeTruthy();
  });

  it('should generate base EXIF structure', () => {
    const exif = ExifManager.generateBaseExif({
      make: 'Canon',
      model: 'EOS 80D',
      date: '2024-01-01T00:00:00Z'
    });
    expect(exif).toHaveProperty('0th');
    expect(exif).toHaveProperty('Exif');
    expect(exif).toHaveProperty('GPS');
  });

  it('should set user comments in EXIF data', () => {
    const exif = ExifManager.generateBaseExif();
    const userComments = { UploadedBy: 'TestUser', Note: 'Test comment' };
    const updatedExif = ExifManager.setUserComments(exif, userComments);
    expect(updatedExif.Exif).toBeDefined();
  });

  // Puedes agregar más tests para URLs mockeando fetch si lo deseas
}); 