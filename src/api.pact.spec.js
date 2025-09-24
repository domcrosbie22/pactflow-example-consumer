import { PactV3 } from '@pact-foundation/pact';
import { API } from './api';
import { MatchersV3 } from '@pact-foundation/pact';
import { Product } from './product';
const { eachLike, like } = MatchersV3;
const Pact = PactV3;

const mockProvider = new Pact({
  consumer: 'pactflow-example-consumer',
  provider: process.env.PACT_PROVIDER
    ? process.env.PACT_PROVIDER
    : 'pactflow-example-provider'
});

describe('API Pact test', () => {
  describe('retrieving a product', () => {
    test('ID 10 exists', async () => {
      const expectedProduct = {
        id: '10',
        type: 'CREDIT_CARD',
        name: '28 Degrees',
        version: 'v1'
      };

      mockProvider
        .given('a product with ID 10 exists')
        .uponReceiving('a request to get product ID 10')
        .withRequest({
          method: 'GET',
          path: '/product/10',
          headers: {
            Authorization: like('Bearer 2019-01-14T11:34:18.045Z')
          }
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: like(expectedProduct)
        });

      return mockProvider.executeTest(async (mockserver) => {
        const api = new API(mockserver.url);
        const product = await api.getProduct('10');
        expect(product).toStrictEqual(new Product(expectedProduct));
        return;
      });
    });

    test('ID 11 exists', async () => {
      const expectedProduct = {
        id: '11',
        type: 'PERSONAL_LOAN',
        name: 'MyFlexiPay',
        version: 'v2'
      };

      mockProvider
        .given('a product with ID 11 exists')
        .uponReceiving('a request to get product ID 11')
        .withRequest({
          method: 'GET',
          path: '/product/11',
          headers: {
            Authorization: like('Bearer 2019-01-14T11:34:18.045Z')
          }
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: like(expectedProduct)
        });

      return mockProvider.executeTest(async (mockserver) => {
        const api = new API(mockserver.url);
        const product = await api.getProduct('11');
        expect(product).toStrictEqual(new Product(expectedProduct));
        return;
      });
    });
  });

  describe('retrieving products', () => {
    test('products exist', async () => {
      const expectedProducts = [
        { id: '09', type: 'CREDIT_CARD', name: 'Gem Visa', version: 'v1' },
        { id: '10', type: 'CREDIT_CARD', name: '28 Degrees', version: 'v1' },
        { id: '11', type: 'PERSONAL_LOAN', name: 'MyFlexiPay', version: 'v2' }
      ];

      mockProvider
        .given('products exist')
        .uponReceiving('a request to get all products')
        .withRequest({
          method: 'GET',
          path: '/products',
          headers: {
            Authorization: like('Bearer 2019-01-14T11:34:18.045Z')
          }
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: eachLike(expectedProducts[0])
        });

      return mockProvider.executeTest(async (mockserver) => {
        const api = new API(mockserver.url);
        const products = await api.getAllProducts();
        console.log('Received products:', products);
        expect(products).toStrictEqual(expectedProducts.map((p) => new Product(p)));
        return;
      });
    });
  });
});
