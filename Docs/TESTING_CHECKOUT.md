# Checkout & PhonePe Testing Guide (Sandbox / UAT)

To thoroughly test the end-to-end integration without spending real money, use the PhonePe Simulator in the UAT environment.

## 1. Prepare for UAT Testing

Ensure your environment variables are configured for UAT, not PRODUCTION.
```
PHONEPE_ENV=UAT
PHONEPE_MERCHANT_ID=PGTESTPAYUAT
PHONEPE_CLIENT_ID=...
PHONEPE_CLIENT_SECRET=...
```
Do not alter the checkout price in `backend/src/modules/community/card.controller.ts`. The order will be created with the real price, but the sandbox environment uses dummy payment flows.

## 2. Initiating the Test Checkout

1. **Start the Servers:**
   Run `./run.sh` from the root directory.

2. **Open the Frontend:**
   Navigate to the local frontend checkout page:
   ```
   http://localhost:3000/orbit-card/checkout
   ```

3. **Fill Out the Form:**
   Enter dummy details in the checkout form. Click **Confirm Order**.

4. **Sandbox Payment Gateway:**
   You will be redirected to the PhonePe simulator. You can choose a mock success or mock failure response.

5. **Complete the Payment:**
   Click "Success" in the simulator to mock a successful payment.

## 3. Verifying the Integration

After you successfully mock the payment, you will be redirected back to your application.

1. **User Redirect:** You will land back on `http://localhost:3000/orbit-card/checkout?payment=success&orderId=...` and see the "Order Initiated" success modal.
2. **Database State:** Open MongoDB Compass. Look in the `business_orbit` database under the `orbitcardorders` collection. 
   - The document's `status` should have transitioned from `PENDING` to `SUCCESS`.
   - The `providerReferenceId` will be saved.

## 4. Going Live

Once testing is complete, switch your `.env` variables back to Production.
```
PHONEPE_ENV=PRODUCTION
PHONEPE_MERCHANT_ID=YOUR_LIVE_MERCHANT_ID
```
No code changes are required.
