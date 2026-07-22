import { ApiBaseSettings } from './environmets/ApiSettings';

describe('API configuration', () => {
  it('uses a same-origin API URL', () => {
    expect(new ApiBaseSettings().baseUrl).toBe('/api');
  });
});
