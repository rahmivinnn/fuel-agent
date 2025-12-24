export async function createStripePaymentIntent(amount: number, currency: string = 'usd') {
  // Mock Stripe payment intent
  return {
    id: `pi_${Date.now()}`,
    client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
    amount: amount * 100, // Stripe uses cents
    currency,
    status: 'requires_payment_method'
  };
}

export async function createPaypalPayout(email: string, amount: string) {
  // Mock PayPal payout
  return {
    batch_id: `batch_${Date.now()}`,
    payout_item_id: `item_${Date.now()}`,
    transaction_id: `txn_${Date.now()}`,
    transaction_status: 'SUCCESS',
    payout_item_fee: '0.25',
    payout_batch_id: `batch_${Date.now()}`,
    sender_batch_id: `sender_${Date.now()}`,
    payout_item: {
      recipient_type: 'EMAIL',
      amount: {
        value: amount,
        currency: 'USD'
      },
      receiver: email,
      sender_item_id: `item_${Date.now()}`
    }
  };
}