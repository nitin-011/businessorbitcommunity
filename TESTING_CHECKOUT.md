# Checkout & PhonePe Testing Guide (Live Production)

Since you are using live **Production** credentials for PhonePe, any transaction processed through the checkout will hit the real PhonePe payment gateway. You will no longer see the PhonePe Simulator.

To thoroughly test the end-to-end integration without spending ₹9,999 on a test transaction, follow this guide to perform a "₹1 Live Test".

## 1. Prepare for a ₹1 Live Test

Instead of testing with the full price, we will temporarily hardcode the backend to charge exactly **₹1** (100 paise). This allows you to use your real UPI app to complete an authentic transaction and verify that the money reaches your PhonePe Business account and the database successfully updates.

### Step 1: Modify the Backend Amount
Open `backend/src/modules/community/card.controller.ts` and locate the `checkoutCard` function (around line 26).

Temporarily change the amount to `100` (which equals ₹1.00):
```typescript
// Temporarily set to 100 paise (1 INR) for live testing
const amount = 100; // original: 49900
```
*(Don't forget to restart your backend after making this change!)*

## 2. Initiating the Test Checkout

1. **Start the Servers:**
   Run `./run.sh` from the root directory. (You no longer need `--ngrok` since we eliminated webhooks and shifted to the Order Status API).

2. **Open the Frontend:**
   Navigate to the local frontend checkout page:
   ```
   http://localhost:3000/orbit-card/checkout
   ```

3. **Fill Out the Form:**
   Enter dummy details in the checkout form. Make sure you don't use real customer info for a test order. Click **Confirm Order**.

4. **Live Payment Gateway:**
   You will be redirected to the real PhonePe payment gateway. It should correctly show the bill as **₹1**.

5. **Complete the Payment:**
   Scan the QR code or enter your UPI ID and approve the ₹1 transaction using your personal PhonePe, GPay, or Paytm app.

## 3. Verifying the Integration

After you successfully approve the ₹1 payment, PhonePe will automatically redirect you back to your application.

1. **User Redirect:** You will land back on `http://localhost:3000/orbit-card/checkout?payment=success&orderId=...` and see the beautiful "Order Initiated" success modal natively.
2. **Database State:** Open MongoDB Compass. Look in the `business_orbit` database under the `orbitcardorders` collection. 
   - The document's `status` should have transitioned from `PENDING` to `SUCCESS`.
   - The `providerReferenceId` (PhonePe's real transaction ID) will be securely saved.
3. **PhonePe Dashboard:** Log into your PhonePe Business Dashboard and confirm the ₹1 transaction appears as successfully settled.

## 4. Cleaning Up (IMPORTANT!)

Once you've confirmed everything works perfectly:

1. **Revert the Amount:** Go back to `backend/src/modules/community/card.controller.ts` and change the amount back to the real price (e.g., `49900` or whatever your launch price is).
2. **Restart the Server:** Restart the backend so it picks up the real price.
3. **Refund the Test:** You can issue a refund for your ₹1 test transaction directly from your PhonePe Business Dashboard.
