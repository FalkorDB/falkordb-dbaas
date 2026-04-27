import { FalkorDBClient } from '../index';

describe('FalkorDBClient', () => {
  it('should create a new instance of FalkorDBClient', () => {
    const falkordb = FalkorDBClient({ client: { url: 'http://localhost:3000' } });
    expect(falkordb).toBeDefined();
  });

  it('should expose defaultClient and setHeaders', () => {
    const falkordb = FalkorDBClient({ client: { url: 'http://localhost:3000' } });
    expect(falkordb.defaultClient).toBeDefined();
    expect(typeof falkordb.setHeaders).toBe('function');
  });
});
