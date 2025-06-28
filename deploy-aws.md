# AWS Lambda Hackathon - Secure Deployment Guide

## 🎯 **Hackathon Requirements Checklist**
- ✅ **Core Service**: 11 AWS Lambda functions with diverse AI/ML capabilities
- ✅ **Lambda Triggers**: API Gateway triggers for all functions
- ✅ **AWS Integration**: Polly, DynamoDB, S3, CloudFormation
- ✅ **Real-world Problem**: AI-powered interview preparation platform

## 🔒 **Security-First Deployment**

### **Step 1: Prepare Environment Variables**

Create a secure parameter file (NOT committed to git):

```bash
# Create aws-lambda-functions/parameters.json (add to .gitignore)
{
  "Parameters": {
    "OpenAIApiKey": "sk-your-openai-key-here",
    "AdobeClientId": "your-adobe-client-id",
    "AdobeClientSecret": "your-adobe-client-secret", 
    "SupabaseUrl": "https://your-project.supabase.co",
    "SupabaseServiceRoleKey": "your-supabase-service-role-key"
  }
}
```

### **Step 2: Deploy Lambda Functions**

```bash
cd aws-lambda-functions

# Install all dependencies
npm run build

# Build SAM application
sam build

# Deploy with guided setup (first time)
sam deploy --guided --parameter-overrides file://parameters.json

# For subsequent deployments
sam deploy --parameter-overrides file://parameters.json
```

### **Step 3: Frontend Deployment Options**

#### **Option A: AWS Amplify (Recommended for Hackathon)**
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
npm run build
amplify publish
```

#### **Option B: AWS S3 + CloudFront**
```bash
# Build the frontend
npm run build

# Create S3 bucket for static hosting
aws s3 mb s3://mockinterview4u-frontend-$(date +%s)

# Enable static website hosting
aws s3 website s3://your-bucket-name --index-document index.html

# Upload build files
aws s3 sync dist/ s3://your-bucket-name

# Create CloudFront distribution (optional for HTTPS)
```

#### **Option C: Vercel (Fastest for Demo)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🌐 **Environment Configuration**

### **Frontend Environment Variables**

Create production environment file:

```bash
# .env.production (add to .gitignore)
VITE_API_BASE_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod
VITE_APP_ENV=production
```

Update your API configuration to use the deployed Lambda endpoints.

## 📋 **Hackathon Submission Checklist**

### **Required Deliverables:**

1. **✅ Public Code Repository**
   - Remove all sensitive data
   - Include comprehensive README.md
   - Add deployment instructions

2. **✅ 3-Minute Demo Video**
   - Show Lambda functions in action
   - Demonstrate API Gateway triggers
   - Highlight AWS service integrations

3. **✅ AWS Tools List**
   - AWS Lambda (11 functions)
   - API Gateway (REST API with 11 endpoints)
   - Amazon Polly (Text-to-Speech)
   - DynamoDB (Analytics storage)
   - S3 (File storage)
   - CloudFormation (Infrastructure as Code)
   - IAM (Security & permissions)

## 🔐 **Security Best Practices Applied**

1. **✅ No secrets in repository**: `.env.local` and `parameters.json` gitignored
2. **✅ AWS Parameter Store**: SAM template uses secure parameters
3. **✅ IAM Least Privilege**: Functions only have required permissions
4. **✅ CORS Configuration**: Properly configured for security
5. **✅ Environment Separation**: Production vs development configs

## 🏆 **Deployment Verification**

Test your deployed application:

```bash
# Test Lambda functions
curl -X POST https://your-api-gateway-url/prod/generate-interview-question \
  -H "Content-Type: application/json" \
  -d '{"role": "Software Engineer", "experience": "junior"}'

# Test frontend integration
# Visit your deployed frontend URL and perform end-to-end testing
```

## 📝 **Final Repository Cleanup**

Before making repository public:

```bash
# Ensure all sensitive files are gitignored
echo "parameters.json" >> aws-lambda-functions/.gitignore
echo ".env.production" >> .gitignore

# Commit final version
git add .
git commit -m "Final AWS Lambda Hackathon submission"
git push origin main

# Make repository public for judging
```

## 🎬 **Demo Video Script Outline**

1. **Opening (30s)**: Problem statement - interview anxiety
2. **Architecture (60s)**: Show 11 Lambda functions + triggers
3. **Live Demo (90s)**: End-to-end interview simulation
4. **AWS Integration (30s)**: Highlight Polly, DynamoDB, S3
5. **Closing (10s)**: Impact and scalability

## 💡 **Judging Criteria Alignment**

- **Quality of Idea**: ✅ Solves real interview anxiety problem
- **Architecture & Design**: ✅ 11 Lambda functions, serverless best practices
- **Completeness**: ✅ Working end-to-end solution with comprehensive features 