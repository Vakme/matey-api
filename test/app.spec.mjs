import { Express } from 'jest-express/lib/express';
import { server } from '../src2/app.mjs';
import jest from 'jest';

let app;

describe('Server', () => {
  beforeEach(() => {
    jest.mock('mongoose');
    app = new Express();
  });
  
  afterEach(() => {
    app.resetMocked();
    jest.resetAllMocks();
  });
  
  test('should setup server', () => {
    const options = {
      port: 8080,
    };
    
    server(app, options);
    
    expect(app.set).toBeCalledWith('port', options.port);
  });
});