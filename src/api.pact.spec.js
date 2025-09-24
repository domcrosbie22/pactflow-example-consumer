import path from 'path';
import { Pact } from '@pact-foundation/pact';
import API from './api';
import { Product } from './product';

describe('Pact Tests for API', () => {
  const provider = new Pact({
    consumer: 'pactflow-example-consumer',
    provider: 'pactflow-example-provider',
    port: 1234,
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'info',
    spec: 2
  });

  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());
  afterEach(() => provider.verify());

  describe('GET /products', () => {
    const expectedProducts = [
      { id: '10', name: '28 Degrees', type: 'CREDIT_CARD' },
      { id: '11', name: 'Low Rate', type: 'DEBIT_CARD' }
    ];

    beforeEach(() => {
      return provider.addInteraction({
        state: 'products exist',
        uponReceiving: 'a request for all products',
        withRequest: {
          method: 'GET',
          path: '/products',
          headers: {
            Authorization: 'Bearer 2019-01-14T11:34:18.045Z'
          }
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: expectedProducts,
          matchingRules: {
            body: {
              '$': {
                matchers: [{ match: 'type', min: 1 }]
              }
            }
          }
        }
      });
    });

    it('should fetch all products', async () => {
      const api = new API('http://localhost:1234');
      const products = await api.getAllProducts();
      expect(products).toEqual(expectedProducts.map((p) => new Product(p)));
    });
  });

  describe('GET /product/:id', () => {
    const productId = '10';
    const expectedProduct = { id: productId, name: '28 Degrees', type: 'CREDIT_CARD' };

    beforeEach(() => {
      return provider.addInteraction({
        state: `a product with ID ${productId} exists`,
        uponReceiving: 'a request for a product by ID',
        withRequest: {
          method: 'GET',
          path: `/product/${productId}`,
          headers: {
            Authorization: 'Bearer 2019-01-14T11:34:18.045Z'
          }
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: expectedProduct,
          matchingRules: {
            body: {
              '$': {
                matchers: [{ match: 'type' }]
              }
            }
          }
        }
      });
    });

    it('should fetch a product by ID', async () => {
      const api = new API('http://localhost:1234');
      const product = await api.getProduct(productId);
      expect(product).toEqual(new Product(expectedProduct));
    });
  });

  describe('GET /product/:id - Not Found', () => {
    const productId = '11';

    beforeEach(() => {
      return provider.addInteraction({
        state: `a product with ID ${productId} does not exist`,
        uponReceiving: 'a request for a non-existent product by ID',
        withRequest: {
          method: 'GET',
          path: `/product/${productId}`,
          headers: {
            Authorization: 'Bearer 2019-01-14T11:34:18.045Z'
          }
        },
        willRespondWith: {
          status: 404
        }
      });
    });

    it('should return 404 for a non-existent product', async () => {
      const api = new API('http://localhost:1234');
      await expect(api.getProduct(productId)).rejects.toThrow();
    });
  });
});