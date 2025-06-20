# MockInterview4u AWS Lambda Deployment Guide

## 🚀 **AWS Lambda Hackathon Implementation**

This guide explains how to deploy the MockInterview4u Standard AI Interview feature to AWS Lambda for the hackathon submission.

## 📋 **Prerequisites**

### Required Tools:
1. **AWS CLI** (v2.x+)
2. **SAM CLI** (v1.x+) 
3. **Node.js** (v18.x+)
4. **OpenAI API Key**

### AWS Account Setup:
1. AWS Account with appropriate permissions
2. IAM roles for Lambda execution
3. API Gateway permissions
4. Amazon Polly permissions

## 🔧 **Installation Steps**

### 1. Install Dependencies
```bash
# Install AWS CLI
# macOS
brew install awscli

# Windows
choco install awscli

# Install SAM CLI
# macOS  
brew tap aws/tap
brew install aws-sam-cli

# Windows
choco install aws-sam-cli
```

### 2. Configure AWS Credentials
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key  
# Default region: us-east-1
# Default output format: json
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
AWS_REGION=us-east-1
CORS_ORIGINS=*
```

## 🚀 **Deployment Process**

### 1. Validate Template
```bash
cd aws-lambda-functions
sam validate
```

### 2. Build Functions
```bash
npm run build
```

### 3. Deploy (First Time)
```bash
npm run deploy
```

Follow the guided setup:
- Stack Name: `mockinterview4u-lambda`
- AWS Region: `us-east-1`
- Parameter OpenAIApiKey: `your_openai_api_key`
- Confirm changes before deploy: `Y`
- Allow SAM CLI IAM role creation: `Y`
- Save parameters to config file: `Y`

### 4. Subsequent Deployments
```bash
npm run deploy:prod
```

## 🔗 **API Endpoints**

After deployment, your endpoints will be:

```
Base URL: https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/prod/

Standard AI Interview Endpoints:
- POST /generate-interview-question
- POST /generate-interview-feedback  
- POST /text-to-speech
- POST /interview-ai (Advanced)
```

## 📊 **Testing the Deployment**

### 1. Test Interview Question Generation
```bash
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/generate-interview-question \
  -H "Content-Type: application/json" \
  -d '{
    "jobRole": "Software Developer",
    "experienceLevel": "intermediate", 
    "yearsOfExperience": 3
  }'
```

### 2. Test Feedback Generation
```bash
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/generate-interview-feedback \
  -H "Content-Type: application/json" \
  -d '{
    "jobRole": "Software Developer",
    "experienceLevel": "intermediate",
    "conversation": [
      {"role": "assistant", "content": "Tell me about your experience with React."},
      {"role": "user", "content": "I have been working with React for 2 years..."}
    ]
  }'
```

### 3. Test Text-to-Speech
```bash
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Welcome to your technical interview. Let us begin with the first question.",
    "voice": "Joanna"
  }'
```

## 🔧 **Frontend Integration**

Update your frontend to use the new AWS Lambda endpoints:

```typescript
// In your frontend environment config
const LAMBDA_BASE_URL = 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod';

// Replace Supabase function calls
const { data, error } = await fetch(`${LAMBDA_BASE_URL}/generate-interview-question`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    jobRole: config.jobRole,
    experienceLevel: config.experienceLevel,
    yearsOfExperience: config.yearsOfExperience,
    conversationHistory: conversation,
  }),
});
```

## 📈 **Monitoring & Logs**

### View Function Logs
```bash
# Question generation logs
sam logs -n GenerateInterviewQuestionFunction --stack-name mockinterview4u-lambda --tail

# Feedback generation logs  
sam logs -n GenerateInterviewFeedbackFunction --stack-name mockinterview4u-lambda --tail

# Text-to-speech logs
sam logs -n TextToSpeechFunction --stack-name mockinterview4u-lambda --tail
```

### CloudWatch Metrics
- Function duration
- Error rates
- Invocation counts
- Cost analysis

## 🔒 **Security Considerations**

1. **API Keys**: Store in AWS Systems Manager Parameter Store
2. **CORS**: Configure appropriate origins for production
3. **Rate Limiting**: Implement API Gateway throttling
4. **Authentication**: Add JWT/API key validation

## 💡 **Hackathon Demo Features**

### Key Differentiators:
1. **Serverless Architecture**: Showcases AWS Lambda's scalability
2. **AI Integration**: OpenAI GPT-4 for intelligent question generation
3. **Voice Processing**: Amazon Polly for realistic speech synthesis
4. **Real-world Application**: Solves actual interview preparation needs
5. **Cost Optimization**: Pay-per-use serverless model

### Demo Scenarios:
1. **Software Developer Interview**: Technical questions with varying difficulty
2. **Experience Level Adaptation**: Questions adjust based on candidate level
3. **Comprehensive Feedback**: Detailed scoring and improvement suggestions
4. **Voice Interaction**: Text-to-speech for immersive interview experience

## 🚨 **Troubleshooting**

### Common Issues:

1. **Permission Errors**: Ensure IAM roles have correct policies
2. **API Gateway CORS**: Check CORS configuration in template.yaml
3. **Function Timeouts**: Increase timeout values for complex operations
4. **OpenAI Rate Limits**: Implement fallback mechanisms

### Debug Commands:
```bash
# Local testing
sam local start-api

# Function logs
aws logs tail /aws/lambda/mockinterview4u-GenerateInterviewQuestionFunction

# Stack events
aws cloudformation describe-stack-events --stack-name mockinterview4u-lambda
```

## 📞 **Support**

For hackathon support:
- Check AWS Lambda documentation
- Review CloudWatch logs for detailed error information
- Test locally using SAM CLI before deploying

---

**🏆 Hackathon Submission Ready!** 

This implementation demonstrates sophisticated use of AWS Lambda with real-world AI applications, perfect for the AWS Lambda Hackathon. 