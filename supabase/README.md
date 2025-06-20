# PayPal Subscription Integration

This directory contains Supabase Edge Functions for handling PayPal subscription integration with Avatar Interview Boost application.

## Setup Instructions

### Environment Variables

The following environment variables need to be set in your Supabase project:

```bash
# PayPal API Credentials
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET_KEY=your_paypal_secret_key
PAYPAL_API_URL=https://api-m.sandbox.paypal.com  # Use https://api-m.paypal.com for production
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id

# PayPal Plan IDs
PAYPAL_BRONZE_MONTHLY_PLAN_ID=your_bronze_monthly_plan_id
PAYPAL_GOLD_MONTHLY_PLAN_ID=your_gold_monthly_plan_id
PAYPAL_DIAMOND_MONTHLY_PLAN_ID=your_diamond_monthly_plan_id
PAYPAL_BRONZE_YEARLY_PLAN_ID=your_bronze_yearly_plan_id
PAYPAL_GOLD_YEARLY_PLAN_ID=your_gold_yearly_plan_id
PAYPAL_DIAMOND_YEARLY_PLAN_ID=your_diamond_yearly_plan_id

# Application URL
WEBSITE_URL=https://your-app-url.com
```

### Setting Up PayPal Plans

1. Create products and plans in the PayPal Developer Dashboard:
   - Navigate to https://developer.paypal.com/dashboard/
   - Go to Products and Plans
   - Create a product for each subscription tier (Bronze, Gold, Diamond)
   - Create monthly and yearly plans for each product
   - Save the plan IDs in your environment variables

### Setting Up PayPal Webhooks

1. Create a webhook in the PayPal Developer Dashboard:
   - Navigate to https://developer.paypal.com/dashboard/
   - Go to Webhooks
   - Create a new webhook pointing to your Supabase Edge Function URL
   - Example URL: https://your-project-ref.supabase.co/functions/v1/paypal-webhook
   - Subscribe to the following events:
     - BILLING.SUBSCRIPTION.CREATED
     - BILLING.SUBSCRIPTION.ACTIVATED
     - BILLING.SUBSCRIPTION.UPDATED
     - BILLING.SUBSCRIPTION.CANCELLED
     - BILLING.SUBSCRIPTION.EXPIRED
     - PAYMENT.SALE.COMPLETED
   - Save the webhook ID in your environment variables

### Deploying the Edge Functions

1. Deploy the Edge Functions to Supabase:
   ```bash
   supabase functions deploy create-paypal-subscription
   supabase functions deploy cancel-subscription
   supabase functions deploy paypal-webhook
   ```

2. Make the functions public:
   ```bash
   supabase functions update --no-verify-jwt create-paypal-subscription
   supabase functions update --no-verify-jwt cancel-subscription
   supabase functions update --no-verify-jwt paypal-webhook
   ```

## Troubleshooting

### Common Issues

1. **Unauthorized Error**: Ensure your PayPal client ID and secret are correct and properly configured in your Supabase environment variables.

2. **Missing Plan ID**: Verify that all plan IDs are set correctly in your environment variables.

3. **Webhook Verification Failed**: Make sure your webhook ID is correctly set in the environment variables and your webhook URL is correctly configured in the PayPal Developer Dashboard.

4. **Invalid/Missing subscription_id**: Check the logs to ensure the subscription ID is being properly passed and stored throughout the process.

### Debug Logs

Enable detailed logging by checking the logs in your Supabase dashboard:

1. Navigate to your Supabase project
2. Go to Database > Edge Functions
3. Select the function you want to debug
4. View the logs for detailed information about any errors or issues

## Database Schema

The integration relies on the following database tables:

1. **profiles** - Stores user profile information
   - id (UUID, Primary Key)
   - email (TEXT)
   - ...other fields

2. **subscriptions** - Stores subscription information
   - id (UUID, Primary Key)
   - user_id (UUID, Foreign Key to profiles.id)
   - plan_type (TEXT, e.g., 'bronze', 'gold', 'diamond')
   - payment_status (TEXT, e.g., 'active', 'cancelled', 'pending')
   - payment_provider_subscription_id (TEXT, PayPal subscription ID)
   - start_date (TIMESTAMP)
   - end_date (TIMESTAMP)
   - billing_cycle (TEXT, e.g., 'monthly', 'yearly')
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP) 