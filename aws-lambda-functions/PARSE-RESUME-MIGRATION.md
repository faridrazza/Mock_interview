# Parse Resume Migration: Supabase → AWS Lambda + Adobe PDF Services

## Overview

This document outlines the migration of resume parsing functionality from Supabase Edge Functions (using unpdf) to AWS Lambda with Adobe PDF Services API.

## Why Migrate?

### Issues with Previous Implementation
- **unpdf Limitations**: Deno-based library with limited PDF parsing capabilities
- **Complex PDF Handling**: Struggled with modern PDF formats and complex layouts
- **Inconsistent Results**: Variable text extraction quality across different PDF types
- **Node.js Incompatibility**: unpdf is Deno-specific, limiting deployment options

### Benefits of New Implementation
- **Superior PDF Processing**: Adobe PDF Services provides industry-leading PDF extraction
- **Better Text Recognition**: Advanced OCR and layout understanding
- **Table Extraction**: Proper handling of tabular data in resumes
- **Document Structure**: Maintains formatting and hierarchy information
- **Enterprise Reliability**: Adobe's robust infrastructure and SLA guarantees
- **Node.js Native**: Full compatibility with AWS Lambda runtime

## Architecture

### Previous (Supabase)
```
Frontend → Supabase Edge Function (Deno) → unpdf → OpenAI → Response
```

### New (AWS Lambda)
```
Frontend → AWS Lambda (Node.js) → Adobe PDF Services → OpenAI → Response
```

## Implementation Details

### New AWS Lambda Function

**Location**: `aws-lambda-functions/src/parse-resume/`

**Key Features**:
- Adobe PDF Services SDK integration
- Maintains mammoth.js for DOCX processing
- Enhanced error handling and logging
- Multipart form data parsing
- Identical API contract with frontend

**Dependencies**:
- `@adobe/pdfservices-node-sdk`: Adobe's official SDK
- `mammoth`: Word document processing
- `axios`: HTTP client for OpenAI API
- `fs-extra`: Enhanced file system operations
- `uuid`: Unique identifier generation
- `adm-zip`: ZIP file handling for Adobe responses

### Environment Variables

The function requires these environment variables:

```bash
OPENAI_API_KEY=your_openai_api_key
ADOBE_CLIENT_ID=your_adobe_client_id
ADOBE_CLIENT_SECRET=your_adobe_client_secret
```

### API Contract

The function maintains the same API contract as the original Supabase function:

**Request**: Multipart form data with:
- `file`: PDF/DOCX resume file
- `jobDescription`: Optional job description for optimization

**Response**:
```json
{
  "parsedResume": {
    "contactInfo": { ... },
    "summary": "...",
    "experience": [...],
    "education": [...],
    "skills": [...],
    "certifications": [...],
    "projects": [...]
  },
  "originalText": "extracted raw text"
}
```

## Deployment Instructions

### Prerequisites

1. **Adobe PDF Services Account**:
   - Sign up at [Adobe Developer Console](https://developer.adobe.com/document-services/apis/pdf-extract/)
   - Create a new project and get Client ID & Secret
   - Adobe provides 500 free document transactions per month

2. **AWS CLI & SAM CLI**:
   ```bash
   # Install AWS CLI
   pip install awscli
   
   # Install SAM CLI
   pip install aws-sam-cli
   ```

3. **Environment Setup**:
   ```bash
   export ADOBE_CLIENT_ID="your_client_id"
   export ADOBE_CLIENT_SECRET="your_client_secret"
   export OPENAI_API_KEY="your_openai_key"
   ```

### Deployment Steps

1. **Navigate to Lambda Functions Directory**:
   ```bash
   cd aws-lambda-functions
   ```

2. **Build the Function**:
   ```bash
   sam build --use-container
   ```

3. **Deploy**:
   ```bash
   ./deploy-parse-resume.sh
   ```

   Or manually:
   ```bash
   sam deploy \
     --parameter-overrides \
       OpenAIApiKey="$OPENAI_API_KEY" \
       AdobeClientId="$ADOBE_CLIENT_ID" \
       AdobeClientSecret="$ADOBE_CLIENT_SECRET" \
     --capabilities CAPABILITY_IAM \
     --resolve-s3
   ```

### Frontend Updates

The frontend components have been updated to use the new AWS Lambda endpoint:

**Before**:
```javascript
const response = await supabase.functions.invoke('parse-resume', {
  body: formData,
  headers: { 'Accept': 'application/json' }
});
```

**After**:
```javascript
const response = await fetch('https://apb59k8zqg.execute-api.us-east-1.amazonaws.com/prod/parse-resume', {
  method: 'POST',
  body: formData,
  headers: { 'Accept': 'application/json' }
});
```

## Testing

### Test with cURL

```bash
curl -X POST \
  https://apb59k8zqg.execute-api.us-east-1.amazonaws.com/prod/parse-resume \
  -F "file=@sample-resume.pdf" \
  -F "jobDescription=Software Engineer position requiring React and Node.js experience"
```

### Expected Response Time
- PDF processing: 5-15 seconds
- DOCX processing: 2-5 seconds
- Total with AI processing: 10-25 seconds

## Monitoring & Troubleshooting

### CloudWatch Logs

Monitor function execution:
```bash
aws logs tail /aws/lambda/Mockinterview4u-ParseResumeFunction-XXXXX --follow
```

### Common Issues

1. **Adobe API Limits**: 500 transactions/month on free tier
2. **Lambda Timeout**: Function timeout set to 60 seconds
3. **Memory Issues**: Function allocated 1024MB RAM
4. **PDF Corruption**: Adobe services will reject corrupted files

### Error Handling

The function provides detailed error messages:
- File format validation
- Adobe service errors
- OpenAI API issues
- Parsing failures with fallback suggestions

## Cost Analysis

### Adobe PDF Services
- **Free Tier**: 500 document transactions/month
- **Paid Plans**: Start at $0.05 per document transaction
- **Enterprise**: Custom pricing with SLA guarantees

### AWS Lambda
- **Compute**: ~$0.000000208 per 100ms (1024MB)
- **Requests**: $0.20 per 1M requests
- **Estimated Cost**: ~$0.001 per resume parsing request

### Comparison with Supabase
- Supabase: Free tier limitations, paid plans start at $25/month
- AWS Lambda: Pay-per-use, more cost-effective for variable workloads

## Migration Checklist

- [x] Create AWS Lambda function with Adobe PDF Services
- [x] Update CloudFormation template
- [x] Migrate frontend components
- [x] Add error handling and logging
- [x] Create deployment scripts
- [x] Document migration process
- [ ] Deploy to production
- [ ] Test with real resume files
- [ ] Monitor performance and errors
- [ ] Update documentation

## Rollback Plan

If issues arise, you can quickly rollback by:

1. **Revert Frontend Changes**:
   ```bash
   git checkout HEAD~1 -- src/components/resume/ResumeUploader.tsx
   git checkout HEAD~1 -- src/components/resume/PublicResumeUploader.tsx
   ```

2. **Re-enable Supabase Function**:
   - Restore the deleted Supabase functions
   - Update frontend to use Supabase endpoints

3. **Gradual Migration**:
   - Use feature flags to toggle between implementations
   - A/B test the new Adobe-based parsing

## Future Enhancements

1. **Caching**: Implement Redis caching for processed resumes
2. **Batch Processing**: Support multiple file uploads
3. **Format Support**: Add support for RTF, TXT files
4. **OCR Enhancement**: Leverage Adobe's OCR for scanned documents
5. **Analytics**: Track parsing success rates and performance metrics

## Support

For issues or questions:
- Check CloudWatch logs for detailed error information
- Review Adobe PDF Services documentation
- Contact the development team with specific error messages 