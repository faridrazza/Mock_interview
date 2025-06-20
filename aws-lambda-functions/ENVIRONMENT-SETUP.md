# Environment Setup for AWS Lambda Hackathon

## 🚀 **Frontend Configuration**

To enable AWS Lambda mode for the hackathon, you need to set environment variables.

### **Option 1: Hackathon Demo Mode**
Create a `.env.local` file in your project root:

```env
# Enable AWS Lambda Hackathon Mode
REACT_APP_HACKATHON_MODE=true

# AWS Lambda API Gateway URL (replace with your deployed URL)
REACT_APP_LAMBDA_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
```

### **Option 2: Force Lambda Usage**
Alternatively, force Lambda usage:

```env
# Force Lambda usage in all environments
REACT_APP_USE_LAMBDA=true
REACT_APP_LAMBDA_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
```

## 🔧 **How It Works**

The frontend now has intelligent switching:

1. **Lambda Mode**: When `REACT_APP_HACKATHON_MODE=true` or `REACT_APP_USE_LAMBDA=true`
   - Uses AWS Lambda functions for all AI processing
   - Automatically falls back to Supabase if Lambda fails
   - Displays "🚀 AWS Lambda Hackathon Mode Enabled!" in console

2. **Development Mode**: When environment variables are not set
   - Uses existing Supabase Edge Functions
   - No changes to current workflow

## 📊 **Testing the Integration**

### **1. Enable Lambda Mode**
```bash
# Create .env.local file
echo "REACT_APP_HACKATHON_MODE=true" > .env.local
echo "REACT_APP_LAMBDA_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod" >> .env.local

# Restart your development server
npm run dev
```

### **2. Check Console Logs**
Look for these messages in browser console:
- `🚀 AWS Lambda Hackathon Mode Enabled!`
- `🚀 Using AWS Lambda for question generation`
- `🚀 Using AWS Lambda for text-to-speech`
- `🚀 Using AWS Lambda for feedback generation`



## 🎯 **Deployment Steps**

### **1. Deploy Lambda Functions**
```bash
cd aws-lambda-functions
npm run deploy
```

### **2. Get API Gateway URL**
After deployment, SAM will output the API Gateway URL:
```
Outputs:
MockInterviewAPI = https://abc123def.execute-api.us-east-1.amazonaws.com/prod/
```

### **3. Update Environment**
Replace `your-api-id` in your `.env.local` with the actual API ID:
```env
REACT_APP_LAMBDA_BASE_URL=https://abc123def.execute-api.us-east-1.amazonaws.com/prod
```

### **4. Test Interview Flow**
1. Start a Standard Interview
2. Check browser console for Lambda usage logs
3. Verify question generation, TTS, and feedback work

## 🏆 **Hackathon Demo Ready!**

Once deployed, your app will showcase:
- ✅ Serverless AWS Lambda architecture
- ✅ Intelligent fallback mechanisms
- ✅ Real-world AI applications
- ✅ Production-ready error handling
- ✅ Cost-optimized pay-per-use model

Perfect for demonstrating advanced AWS Lambda implementation! 