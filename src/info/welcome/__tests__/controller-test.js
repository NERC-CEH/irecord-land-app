import API from '../controller';

describe('Info Welcome Controller', () => {
  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });
});
