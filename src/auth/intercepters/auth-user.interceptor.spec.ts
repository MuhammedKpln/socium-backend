import { AuthUserInterceptor } from './auth-user.interceptor';

describe('AuthUserInterceptor', () => {
  it('should be defined', () => {
    expect(new AuthUserInterceptor()).toBeDefined();
  });
});
