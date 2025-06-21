#!/bin/bash

# Deploy Parse Resume Function to AWS Lambda
# This script builds and deploys the parse-resume function with Adobe PDF Services

echo "🚀 Starting Parse Resume Function Deployment..."

# Check if required environment variables are set
if [ -z "$ADOBE_CLIENT_ID" ] || [ -z "$ADOBE_CLIENT_SECRET" ] || [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: Required environment variables are not set"
    echo "Please set the following environment variables:"
    echo "  - ADOBE_CLIENT_ID"
    echo "  - ADOBE_CLIENT_SECRET" 
    echo "  - OPENAI_API_KEY"
    exit 1
fi

# Build the function
echo "📦 Building SAM application..."
sam build --use-container

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Deploy with parameters
echo "🚀 Deploying to AWS..."
sam deploy \
    --parameter-overrides \
        OpenAIApiKey="$OPENAI_API_KEY" \
        AdobeClientId="$ADOBE_CLIENT_ID" \
        AdobeClientSecret="$ADOBE_CLIENT_SECRET" \
    --capabilities CAPABILITY_IAM \
    --resolve-s3

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🔗 Your API endpoints:"
    echo "  - Parse Resume: https://apb59k8zqg.execute-api.us-east-1.amazonaws.com/prod/parse-resume"
    echo ""
    echo "📝 Next steps:"
    echo "  1. Test the parse-resume endpoint with a sample PDF/DOCX file"
    echo "  2. Update your frontend to use the new AWS Lambda endpoint"
    echo "  3. Monitor CloudWatch logs for any issues"
else
    echo "❌ Deployment failed!"
    exit 1
fi 