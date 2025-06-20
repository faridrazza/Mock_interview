# AWS Lambda Hackathon Setup Guide

## Prerequisites
1. AWS Account (with Lambda free tier)
2. AWS CLI installed and configured
3. Node.js 18+ installed
4. SAM CLI (Serverless Application Model)

## AWS Services We'll Use

### Core Requirements:
- **AWS Lambda** (Core Service - Required)
- **API Gateway** (Lambda Trigger - Required)

### Additional Services:
- **DynamoDB** (Database for caching/analytics)
- **S3** (File storage for resumes/audio)
- **Bedrock** (Alternative AI service for redundancy)
- **EventBridge** (Scheduled events for analytics)

## Setup Instructions

### 1. Install AWS CLI
```bash
# Windows
choco install awscli

# macOS
brew install awscli

# Verify installation
aws --version
```

### 2. Configure AWS Credentials
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1
# Default output format: json
```

### 3. Install SAM CLI
```bash
# Windows
choco install aws-sam-cli

# macOS
brew install aws-sam-cli

# Verify installation
sam --version
```

### 4. Create AWS Lambda Function Structure
We'll migrate these Supabase functions to AWS Lambda:

**Priority Functions for Migration:**
1. `advanced-interview-ai` → `interview-ai-lambda`
2. `ats-analysis` → `ats-analyzer-lambda`
3. `speech-to-text` → `speech-processor-lambda`
4. `text-to-speech` → `voice-generator-lambda`
5. `generate-interview-feedback` → `feedback-generator-lambda`

## Project Structure
```
aws-lambda-functions/
├── template.yaml                 # SAM template
├── src/
│   ├── interview-ai/             # Advanced interview AI
│   ├── ats-analyzer/             # Resume ATS analysis
│   ├── speech-processor/         # Speech to text
│   ├── voice-generator/          # Text to speech
│   ├── feedback-generator/       # Interview feedback
│   └── shared/                   # Common utilities
├── package.json
└── README.md
```

## Environment Variables
```
OPENAI_API_KEY=your_openai_key
GOOGLE_CLIENT_EMAIL=your_google_email
GOOGLE_PRIVATE_KEY=your_google_key
CORS_ORIGINS=Your_domain
```

## Cost Considerations
- Lambda: 1M free requests/month
- API Gateway: 1M free requests/month
- DynamoDB: 25GB free storage
- S3: 5GB free storage
- Estimated monthly cost for hackathon: $0-5

## Next Steps
1. Set up AWS account with free tier
2. Install all required tools
3. Run AWS credential configuration
4. Create initial Lambda function structure 