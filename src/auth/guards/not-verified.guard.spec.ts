import { NotVerifiedGuard } from './not-verified.guard';

describe('NotVerifiedGuard', () => {
  it('should be defined', () => {
    expect(new NotVerifiedGuard()).toBeDefined();
  });
});
