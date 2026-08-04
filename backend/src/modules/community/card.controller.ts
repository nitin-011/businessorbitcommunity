import { Request, Response } from 'express';
import { OrbitCardOrder } from '../../models/OrbitCardOrder';
import { config } from '../../config/env';
import { AuthRequest } from '../../middleware/auth';
import { StandardCheckoutClient, Env, StandardCheckoutPayRequest } from '@phonepe-pg/pg-sdk-node';

const phonepeEnv = config.phonepeEnv === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX;

const client = StandardCheckoutClient.getInstance(
  config.phonepeClientId,
  config.phonepeClientSecret,
  parseInt(config.phonepeClientVersion) || 1,
  phonepeEnv
);

export const checkoutCard = async (req: AuthRequest, res: Response) => {
  try {
    const memberId = req.member?.id || null;

    const { shippingAddress, fullName, companyAndDesignation, email, phone } = req.body;
    if (!shippingAddress || !fullName || !companyAndDesignation || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const transactionId = `T${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const amount = 49900; // 499 INR in paise

    const order = await OrbitCardOrder.create({
      memberId,
      shippingAddress,
      fullName,
      email,
      phone,
      companyAndDesignation,
      amount,
      transactionId,
      status: 'PENDING'
    });

    // Instead of redirecting directly to frontend, we intercept the redirect at our backend to check order status
    const redirectUrl = `${config.apiUrl}/api/community/card/payment-status?orderId=${transactionId}`;

    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(transactionId)
      .amount(amount)
      .redirectUrl(redirectUrl)
      .build();

    const response = await client.pay(request);

    return res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        paymentUrl: response.redirectUrl
      }
    });
  } catch (error: any) {
    console.error('Checkout error:', error?.response?.data || error);
    return res.status(500).json({ success: false, message: 'Payment initiation failed', error: error?.response?.data || error?.message || String(error) });
  }
};

export const paymentRedirect = async (req: Request, res: Response) => {
  try {
    const orderId = req.query.orderId as string || req.body.transactionId as string;
    
    if (!orderId) {
      return res.redirect(`${config.frontendUrl}/orbit-card/checkout?payment=error_missing_order_id`);
    }

    const response = await client.getOrderStatus(orderId);

    if (response.state === 'COMPLETED') {
      await OrbitCardOrder.findOneAndUpdate(
        { transactionId: orderId },
        { status: 'SUCCESS', providerReferenceId: response.transactionId || '' }
      );
      return res.redirect(`${config.frontendUrl}/orbit-card/checkout?payment=success&orderId=${orderId}`);
    } else if (response.state === 'PENDING') {
      return res.redirect(`${config.frontendUrl}/orbit-card/checkout?payment=pending&orderId=${orderId}`);
    } else {
      // For FAILED, USER_CANCELLED, etc.
      await OrbitCardOrder.findOneAndUpdate(
        { transactionId: orderId },
        { status: 'FAILED' }
      );
      return res.redirect(`${config.frontendUrl}/orbit-card/checkout?payment=failed&orderId=${orderId}`);
    }
  } catch (error) {
    console.error('Payment Redirect Error:', error);
    return res.redirect(`${config.frontendUrl}/orbit-card/checkout?payment=error`);
  }
};
