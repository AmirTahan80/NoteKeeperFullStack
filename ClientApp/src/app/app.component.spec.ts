import { ApiBaseSettings } from './environmets/ApiSettings';
import { AuthenticationModel } from './environmets/AuthenticationModel';

describe('API configuration', () => {
  it('uses a same-origin API URL', () => {
    expect(new ApiBaseSettings().baseUrl).toBe('/api');
  });
});

describe('AuthenticationModel', () => {
  const authentication = new AuthenticationModel();

  afterEach(() => localStorage.clear());

  it('accepts a token that has not expired', () => {
    authentication.Set(createToken(Math.floor(Date.now() / 1000) + 60), 'test-user');

    expect(authentication.IsUserLogin()).toBeTrue();
    expect(authentication.GetUserName()).toBe('test-user');
  });

  it('clears an expired token instead of keeping the user in a login loop', () => {
    authentication.Set(createToken(Math.floor(Date.now() / 1000) - 60), 'test-user');

    expect(authentication.IsUserLogin()).toBeFalse();
    expect(authentication.GetToken()).toBeNull();
    expect(authentication.GetUserName()).toBeNull();
  });

  it('clears malformed tokens', () => {
    authentication.Set('not-a-jwt', 'test-user');

    expect(authentication.IsUserLogin()).toBeFalse();
    expect(authentication.GetToken()).toBeNull();
  });
});

function createToken(exp: number): string {
  const payload = btoa(JSON.stringify({ exp }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `header.${payload}.signature`;
}
