import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import adminRoutes from '../routes';
import { OrbitCardOrder } from '../../../models/OrbitCardOrder';

const app = express();
app.use(express.json());

// Mock auth middleware for admin
jest.mock('../../../middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.admin = { id: 'admin123', email: 'admin@boc.com', role: 'admin' };
    next();
  }
}));

app.use('/api/admin', adminRoutes);

describe('Admin Routes', () => {
  beforeAll(async () => {
    // Setup mongoose connection if needed (mocked for this test mostly)
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Orbit Card Fulfillment', () => {
    it('should export successful orders to CSV', async () => {
      const mockOrders = [
        {
          _id: new mongoose.Types.ObjectId(),
          transactionId: 'T123',
          createdAt: new Date('2026-08-01T00:00:00Z'),
          memberId: {
            name: 'Test Member',
            email: 'test@example.com',
            company: 'Test Co'
          },
          shippingAddress: '123 Test St',
          amount: 49900
        }
      ];

      const findMock = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockOrders)
        })
      });
      jest.spyOn(OrbitCardOrder, 'find').mockImplementation(findMock as any);

      const res = await request(app).get('/api/admin/orders/export');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('orderId');
      expect(res.text).toContain('transactionId');
      expect(res.text).toContain('Test Member');
      expect(res.text).toContain('499');
    });

    it('should return 404 if no successful orders to export', async () => {
      const findMock = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([])
        })
      });
      jest.spyOn(OrbitCardOrder, 'find').mockImplementation(findMock as any);

      const res = await request(app).get('/api/admin/orders/export');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('No successful orders found to export');
    });
  });
});
