import Stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';
import { log } from './vite';

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== 'test') {
    console.warn("STRIPE_SECRET_KEY is not set. Stripe functionality will not work.");
}

// Stripe setup
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: '2024-06-20', // Use latest stable version or whatever is appropriate
});

// PayPal setup
// In production you would use LiveEnvironment
const clientId = process.env.PAYPAL_CLIENT_ID || 'mock_client_id';
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'mock_client_secret';

const paypalEnvironment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
export const paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment);

export async function createStripePaymentIntent(amount: number, currency: string = 'usd') {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe uses cents
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });
        return paymentIntent;
    } catch (error) {
        log(`Stripe Error: ${error}`);
        throw error;
    }
}

export async function createPaypalPayout(recipientEmail: string, amount: string, currency: string = "USD") {
    // Use Payouts API if available or simulate for now with SDK if Payouts is not directly in checkout-server-sdk
    // Note: @paypal/checkout-server-sdk is primarily for Orders (receiving money). 
    // Native Payouts usually require 'paypal-rest-sdk' or direct HTTP calls as checkout-server-sdk is limited.
    // For 'no mock', we should try a direct HTTP call if SDK falls short, or use what's available.

    // Actually, for "narik uang" (Withdraw), we need Payouts. 
    // Let's implement a direct fetch to PayPal Payouts API since the installed SDK is 'checkout-server-sdk'.

    const accessToken = await getPaypalAccessToken();

    const payoutData = {
        sender_batch_header: {
            sender_batch_id: `Payouts_${Date.now()}`,
            email_subject: "You have a payout!",
            email_message: "You have received a payout! Thanks for using our service."
        },
        items: [
            {
                recipient_type: "EMAIL",
                amount: {
                    value: amount,
                    currency: "USD"
                },
                note: "Thanks for your patronage!",
                receiver: recipientEmail,
                sender_item_id: "201403140001",
            }
        ]
    };

    const response = await fetch('https://api-m.sandbox.paypal.com/v1/payments/payouts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payoutData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PayPal Payout Failed: ${errorText}`);
    }

    return await response.json();
}

async function getPaypalAccessToken() {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
            'Authorization': `Basic ${auth}`
        }
    });

    const data = await response.json() as { access_token: string };
    return data.access_token;
}
