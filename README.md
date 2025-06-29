# MockInterview4u - AWS Lambda Hackathon Submission

> **AWS Lambda Hackathon Project Entry**

## **Project Overview**

**MockInterview4u** is a comprehensive AI-powered interview preparation platform that combines cutting-edge technology with real-world interview simulation to help job seekers practice mock interview and build resume. This platform leverages the power of AWS serverless architecture to deliver a scalable, intelligent, and user-friendly interview practice experience. Apart from the interview feature, the application also offers a resume builder to help users craft professional, job-ready resumes.

🌐 Live Application: https://dev.d1k9j74c9fglqj.amplifyapp.com

🌐 You can use this existing Email id and password to Login : Email - speakjar@gmail.com and Password - Hello@5858

🌐 You can also create new account to test application

---

## **Tech Stack**

### **AWS Cloud Infrastructure:**
- **AWS Lambda** - 11 serverless functions 
- **API Gateway** - RESTful API endpoints with CORS configuration
- **Amazon Polly** - Neural text-to-speech
- **S3** - File storage 
- **CloudFormation/SAM** - Infrastructure as Code deployment
- **Cloudwatch** - For monitoring
- **Amplify**  - For Frontend Hosting


### **AI & External Services:**
- **OpenAI GPT-4** - AI Integration in the application
- **OpenAI Whisper** - Speech-to-text transcription
- **Adobe PDF Services** - Enterprise-grade PDF text extraction
- **Supabase PostgreSQL** - Primary database

### **Frontend Technologies:**
- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript development
- **React** - Component-based UI framework
- **shadcn/ui** - Modern React component library
- **Tailwind CSS** - Utility-first CSS framework
- **Three.js/React Three Fiber** - 3D avatar rendering and animation

---

## **AWS Lambda Functions Overview**

### **11 Serverless Functions Powering the Platform:**

| Function | Endpoint | Purpose | Triggers |
|----------|----------|---------|----------|
| `GenerateInterviewQuestionFunction` | `/generate-interview-question` | Standard AI interview question generation | API Gateway POST |
| `GenerateInterviewFeedbackFunction` | `/generate-interview-feedback` | Comprehensive interview feedback analysis | API Gateway POST |
| `TextToSpeechFunction` | `/text-to-speech` | Amazon Polly voice synthesis with lip-sync | API Gateway POST |
| `InterviewAIFunction` | `/interview-ai` | Advanced AI conversation management | API Gateway POST |
| `ATSAnalysisFunction` | `/ats-analysis` | Resume ATS compatibility scoring | API Gateway POST + OPTIONS |
| `SpeechProcessorFunction` | `/speech-to-text` | OpenAI Whisper speech-to-text | API Gateway POST |
| `AdvancedInterviewAIFunction` | `/advanced-interview-ai` | Company-specific interview engine | API Gateway POST |
| `GenerateCompanyQuestionsFunction` | `/generate-company-questions` | Company-specific question generation | API Gateway POST |
| `ParseResumeFunction` | `/parse-resume` | Adobe PDF Services text extraction | API Gateway POST + OPTIONS |
| `EnhanceResumeFunction` | `/enhance-resume` | AI-powered resume content improvement | API Gateway POST |
| `CreateResumeFunction` | `/create-resume` | Resume storage and user management | API Gateway POST + OPTIONS |


### **Lambda Triggers Implementation :**

**Primary Trigger: API Gateway HTTP Events**
- All 11 Lambda functions are triggered via **API Gateway REST API endpoints**
- Each function responds to HTTP POST requests with JSON payloads
- CORS-enabled endpoints support web application integration
- Real-time serverless execution triggered by user interactions

**Trigger Examples:**
- User starts interview → `POST /generate-interview-question` → Triggers question generation Lambda
- User speaks answer → `POST /speech-processor` → Triggers OpenAI Whisper transcription Lambda  
- User uploads resume → `POST /parse-resume` → Triggers Adobe PDF parsing Lambda
- AI speaks question → `POST /text-to-speech` → Triggers Amazon Polly synthesis Lambda
- User requests feedback → `POST /generate-interview-feedback` → Triggers analysis Lambda

---


## ** Build To Solve A Real Problem**

MockInterview4U is  built to solve real problems faced by job seekers:

Mock Interview Practice: Simulates real interview scenarios with both standard and advanced AI, helping users reduce anxiety and improve performance.

Instant Feedback: Get personalized suggestions immediately after each session — no waiting, no guessing.

Resume + Interview in One: Combines AI-powered mock interviews with an ATS-friendly resume builder, making it a complete job-prep solution.

Built for Outcomes: Helps users confidently walk into interviews with a strong resume and stronger answers.


---

## **AWS Lambda Implementation**

### **Core Lambda Functions:**

Starting with **Standard AI Interview Feature - Complete Breakdown**

**Step-by-Step Flow:**

1. Interview Configuration (`InterviewConfig.tsx`)
   - User selects job role and 
   - User has option to select either fresher or experienced
   - If the user selects "Experienced," they should be prompted to enter their years of experience.
   - Subscription limit checking
   - Session storage for configuration

2. Interview Session Initialization (`InterviewSession.tsx`)
   - Database record creation
   - Timer start
   - 3D Avatar setup
   - First question generation (Aws lamda)

3. AI Question Generation **(AWS LAMDA)** 
   - OpenAI GPT-4 integration
   - Experience-level adaptive prompts
   - Context-aware conversation flow
   - Fallback system for reliability

4. Text-to-Speech with Lip-Sync **(AWS LAMDA)**
   - **Amazon Polly** neural voice synthesis
   - Advanced phonetic lip-sync generation
   - Rhubarb mouth shape mapping (A-H, X)
   - Timing synchronization

5. 3D Avatar Rendering (`Avatar3D.tsx`)
   - Three.js/React Three Fiber
   - 3D Avatar glb.file and animation file
   - Real-time mouth shape application
   - 60 FPS smooth animation
   - Performance-optimized facial mesh updates

6. User Response Handling Converting Speech to Text **(AWS LAMDA)**
   - Voice input via OpenAI Whisper
   - Text input processing
   - Message state management

7. Conversation Flow Management 
   - Storing conversation history for better context and feedback generation
   - AI thinking states
   - Message threading

8. Interview Feedback Generation **(AWS LAMDA)**
   - Multi-dimensional scoring (communication, technical, clarity)
   - Actionable insights (Areas of improvemnt)

## **Lip-Sync Technology Explained**

### **How It Works:**
1. **Phonetic Analysis**: Text is broken down into speech sounds (phonemes)
2. **Rhubarb Mapping**: Each phoneme maps to one of 9 mouth shapes:
   - **A**: Open mouth (vowels like "father")
   - **B**: Closed mouth (consonants like "b", "m", "p")
   - **C**: Wide mouth (vowels like "bite")
   - **D**: Round mouth (vowels like "go")
   - **E**: Small mouth (vowels like "bed")
   - **F**: Bottom lip to teeth ("f", "v" sounds)
   - **G**: Teeth touching ("t", "d", "s", "z")
   - **H**: Tongue visible ("th", "l")
   - **X**: Neutral/silence

3. **Timing Calculation**: Synchronizes mouth shapes with audio duration
4. **Real-time Application**: Updates 3D model morph targets at 60 FPS
5. **Smooth Transitions**: Interpolates between shapes for natural movement

### **Technical Stack Used:**
- **AWS Lambda**: Serverless compute for all AI processing
- **Amazon Polly**: Neural text-to-speech synthesis
- **OpenAI GPT-4 API**: Advanced question generation and feedback
- **OpenAI Whisper**: Speech-to-text transcription
- **Three.js**: 3D rendering and animation
- **React Three Fiber**: React integration for 3D
- **GLTF Models**: 3D avatar with morph targets

**Files Used in Standard AI Feature:**

**Frontend Files:**
- `src/pages/InterviewConfig.tsx` - Interview configuration UI
- `src/pages/InterviewSession.tsx` - Main interview session management
- `src/components/Avatar3D.tsx` - 3D avatar with lip-sync rendering
- `src/components/AudioRecorder.tsx` - Voice input recording
- `src/components/ChatMessage.tsx` - Chat message display
- `src/components/interview/InterviewConfigCard.tsx` - Configuration form
- `src/components/interview/InterviewFeedback.tsx` - Feedback display
- `src/config/aws-lambda.ts` - AWS Lambda API integration
- `src/types/interview.ts` - TypeScript interfaces
- `src/utils/subscriptionUtils.ts` - Subscription limit checking

**AWS Lambda Functions:**
- `aws-lambda-functions/src/generate-interview-question/index.js` - AI question generation
- `aws-lambda-functions/src/generate-interview-feedback/index.js` - Performance analysis
- `aws-lambda-functions/src/text-to-speech/index.js` - Amazon Polly integration
- `aws-lambda-functions/src/speech-processor/index.js` - OpenAI Whisper transcription

**AWS Lambda Triggers Used in Standard AI Feature:**

1. **API Gateway HTTP Triggers** - All Lambda functions are triggered via API Gateway endpoints:
   - `POST /generate-interview-question` - Triggers question generation Lambda
   - `POST /generate-interview-feedback` - Triggers feedback analysis Lambda  
   - `POST /text-to-speech` - Triggers Amazon Polly voice synthesis Lambda
   - `POST /speech-processor` - Triggers OpenAI Whisper transcription Lambda

2. **Event-Driven Architecture** - Each user interaction triggers Lambda functions:
   - User starts interview → Question generation Lambda triggered
   - User submits answer → Next question Lambda triggered with conversation context
   - User requests feedback → Feedback analysis Lambda triggered with full conversation
   - AI speaks question → Text-to-speech Lambda triggered for voice synthesis
   - User speaks answer → Speech processor Lambda triggered for transcription

3. **Serverless Workflow** - Multiple Lambda functions work together:
   - Frontend calls API Gateway endpoints
   - API Gateway routes requests to appropriate Lambda functions
   - Lambda functions process AI requests and return responses
   - Results flow back through API Gateway to frontend
   - No server management required - pure serverless architecture

This documentation shows exactly how each component works together to create a sophisticated, production-ready interview preparation platform powered by AWS Lambda

---

### **2. Advanced AI Interview Feature**

The Advanced AI Interview provides company-specific interview preparation with advnance interview questions from major tech companies, enhanced mock interviews detailed preparation guidance.

**Files Used in Advanced AI Feature:**

**Step-by-Step Flow:**

1. **Advanced Interview Configuration** (`AdvancedInterviewConfig.tsx`)
   - User selects specific company 
   - User chooses job role
   - Subscription limit checking for advanced interviews
   - Company-specific question generation triggered

2. **Company-Specific Question Generation** **(AWS LAMBDA)**
   - `generate-company-questions` Lambda generates realistic interview questions
   - OpenAI GPT-4 creates questions based on known company interview practices
   - Questions include references to real sources (Glassdoor, LeetCode, Stack Overflow)
   - Categorized by type: Technical, Behavioral, System Design, Problem Solving, Leadership
   - Preparation suggestions tailored to company culture and values

3. **Question Review and Preparation** 
   - Generated questions displayed with categories and references
   - PDF export functionality for offline preparation
   - Preparation suggestions specific to company and role
   - User can start mock interview or study questions independently

4. **Advanced Interview Session** (`AdvancedInterviewSession.tsx`)
   - AI Mock interview practice with 3D Avatar 
   - AI takes the mock interview 
   - Enhanced conversation management with generated questions
   - Questions flow naturally with follow-up questions

5. **Company-Aware AI Conversation** **(AWS LAMBDA)**
   - `advanced-interview-ai` Lambda manages conversation flow
   - AI incorporates company values and culture in questioning
   - Follow-up questions based on company-specific criteria
   - Context-aware responses that reference company practices

6. **Voice Interaction (AWS LAMBDA )and Avatar** (Shared with Standard AI)
   - Same high-quality voice synthesis and lip-sync technology
   - 3D avatar provides consistent interview experience
   - Real-time speech-to-text for user responses

7. **Feedback Analysis** **(AWS LAMBDA)**
   - Based on the entire interview seeion, AI generate feedback
   - Technical evaluation 
   - Hiring recommendations based on company expectations

8. **PDF Export and Preparation Materials** (`PdfExport.tsx`)
   - Professional PDF generation 
   - Organized question categories with references
   - Preparation suggestions formatted for study
   - Exportable for offline interview preparation

**Frontend Files Advance AI Feature:**
- `src/pages/AdvancedInterviewConfig.tsx` - Company and role selection interface
- `src/pages/AdvancedInterviewSession.tsx` - Advanced interview session management
- `src/components/Avatar3D.tsx` - 3D avatar with lip-sync rendering (shared)
- `src/components/AudioRecorder.tsx` - Voice input recording (shared)
- `src/components/advanced-interview/CompanySelector.tsx` - Company selection component
- `src/components/advanced-interview/PdfExport.tsx` - PDF export functionality
- `src/components/interview/JobRoleSelector.tsx` - Job role selection component
- `src/config/aws-lambda.ts` - AWS Lambda API integration (shared)
- `src/types/advancedInterview.ts` - TypeScript interfaces for advanced features
- `src/utils/subscriptionUtils.ts` - Subscription limit checking (shared)

**AWS Lambda Functions used in Advance AI Feature:**
- `aws-lambda-functions/src/generate-company-questions/index.js` - Company-specific question generation
- `aws-lambda-functions/src/interview-ai/index.js` - Advanced conversation management
- `aws-lambda-functions/src/generate-interview-feedback/index.js` - Performance analysis (shared)
- `aws-lambda-functions/src/text-to-speech/index.js` - Amazon Polly integration (shared)
- `aws-lambda-functions/src/speech-processor/index.js` - OpenAI Whisper transcription (shared)

**AWS Lambda Triggers Used in Advanced AI Feature:**

1. **API Gateway HTTP Triggers** - Advanced interview Lambda functions triggered via endpoints:
   - `POST /generate-company-questions` - Triggers company-specific question generation
   - `POST /advanced-interview-ai` - Triggers advanced conversation management
   - `POST /generate-interview-feedback` - Triggers company-aware feedback analysis
   - `POST /text-to-speech` - Triggers voice synthesis (shared)
   - `POST /speech-processor` - Triggers speech transcription (shared)

2. **Event-Driven Company Interview Workflow**:
   - User selects company → Company questions Lambda triggered with company context
   - User exports PDF → Client-side PDF generation with  AI generated company question
   - User start Mock interview → Advance AI interview Session Start
   - User starts advanced interview → Advanced AI Lambda triggered with generated company question
   - User answers question → Next question Lambda triggered
   - User requests feedback → Advanced feedback Lambda triggered 

---

## **ATS Score System - Complete Workflow**

### **3. Intelligent ATS Compatibility Analysis**

The platform features a sophisticated ATS (Applicant Tracking System) scoring system that evaluates resume compatibility using AI-powered analysis across multiple AWS Lambda functions.

**Step-by-Step ATS Score Workflow:**

1. **Resume Upload & Parsing** (`PublicResumeUploader.tsx` → `parse-resume` **AWS LAMBDA**)
   - User uploads PDF or DOCX file through drag-and-drop interface
   - File validation ensures supported formats (PDF, DOC, DOCX)
   - Optional job description input for targeted analysis
   - `parse-resume` Lambda function extracts text using Adobe PDF Services
   - OpenAI GPT-4 structures raw text into standardized resume format
   - Returns parsed resume content and original text

2. **ATS Compatibility Analysis** (`PublicResumePage.tsx` → `ats-analysis` **AWS LAMBDA**)
   - Parsed resume content sent to `ats-analysis` Lambda function
   - OpenAI GPT-4 performs comprehensive ATS evaluation
   - **7-Category Scoring System (0-100 Total Points):**
     - **Hard Skills Match** (0-40 points): Technical skills, programming languages, tools
     - **Job Title Match** (0-15 points): Career progression and title alignment
     - **Soft Skills Match** (0-15 points): Leadership, communication, teamwork abilities
     - **Quantified Achievements** (0-10 points): Measurable results and metrics
     - **Education & Certifications** (0-10 points): Relevant degrees and professional credentials
     - **ATS Formatting** (0-5 points): Technical compatibility with ATS systems
     - **Overall Relevance** (0-5 points): Job description alignment and industry standards

3. **Detailed Analysis Results** (`PublicResumePage.tsx`)
   - **ATS Score Display**: Visual progress indicators and category breakdowns
   - **Keyword Analysis**: Matched vs. missing keywords from job description
   - **Formatting Issues**: Detection of ATS-problematic elements (tables, graphics, fonts)
   - **Improvement Suggestions**: Specific, actionable recommendations for each category
   - **Template Preview**: Show user how their resume will look on our ATS-optimized templates

4. **Template Optimization Preview** 
   - Real-time preview of resume in 10 ATS-optimized templates
   - Template benefits clearly explained (clean formatting, proper hierarchy, ATS compatibility)
   - Interactive template switching with live score updates
   - Professional formatting that ATS systems can easily parse

5. **Account Creation & Resume Storage** (`create-resume` **AWS LAMBDA**)
   - Anonymous users: Temporary resume storage (24-hour expiration)
   - Authenticated users: Permanent resume storage in database
   - ATS score preserved and associated with resume record
   - Seamless transition to full editing capabilities

6. **Modern Resume Editor & AI Enhancement** (`ModernResumeEditor.tsx` → `enhance-resume` **AWS LAMBDA**)
   - **Template Gallery**: 10+ ATS-optimized professional templates
   - **Design Customization**: Colors, fonts, spacing while maintaining ATS compatibility
   - **Section Reordering**: Drag-and-drop section organization
   - **Real-time Preview**: Live template rendering 
   - **Auto-save Functionality**: Draft preservation in localStorage
   - **AI Enhancement Features**: Section-by-section content improvement using OpenAI GPT-4

**Files Used in ATS Score System:**

**Frontend Files:**
- `src/components/resume/PublicResumeUploader.tsx` - File upload and initial processing
- `src/pages/PublicResumePage.tsx` - ATS analysis results display and template comparison
- `src/pages/ModernResumeEditor.tsx` - Resume editing with AI enhancement capabilities
- `src/components/resume/ATSScoreIndicator.tsx` - Visual score representation
- `src/components/resume/ResumeTemplatePreview.tsx` - Template optimization preview

**AWS Lambda Functions:**
- `aws-lambda-functions/src/parse-resume/index.js` - Resume parsing and text extraction
- `aws-lambda-functions/src/ats-analysis/index.js` - ATS compatibility scoring engine
- `aws-lambda-functions/src/create-resume/index.js` - Resume storage with ATS score preservation
- `aws-lambda-functions/src/enhance-resume/index.js` - AI-powered content improvement in editor

**AWS Lambda Triggers Used in ATS Score System:**

1. **Multi-Stage Processing Pipeline**:
   - File upload → `parse-resume` Lambda triggered with Adobe PDF Services integration
   - Parse completion → `ats-analysis` Lambda triggered with OpenAI GPT-4 analysis
   - Score calculation → Frontend displays comprehensive results with improvement suggestions
   - User saves resume → `create-resume` Lambda triggered with Resume data preservation
   - User enhances content → `enhance-resume` Lambda triggered for AI-powered improvements

2. **Intelligent Content Processing**:
   - **Adobe PDF Services Integration**: Enterprise-grade PDF text extraction with complex layout handling
   - **OpenAI GPT-4 Analysis**: Advanced natural language processing for scoring
   - **Contextual Enhancement**: Job description for better ats analysis
   - **Template-Aware Scoring**: Accounts for ATS-optimized template benefits in final scoring

3. **Scalable Storage Architecture**:
   - **Anonymous User Support**: Temporary storage for public resume analysis
   - **Authenticated User Integration**: Permanent storage with full editing capabilities
   - **Session Management**: Seamless transition from anonymous to authenticated workflows

**ATS Score Value Proposition:**

- **Immediate Feedback**: Instant 0-100 compatibility score with detailed breakdown
- **Actionable Insights**: Specific improvements categorized by impact and difficulty
- **Template Optimization**: ATS-friendly designs Templates

**Complete ATS Workflow: Upload → Parse → Analyze → Score Display → Save with Score → Edit & Enhance**

The `enhance-resume` Lambda function is integral to the complete workflow, providing users with AI-powered improvements based on their original ATS analysis results. This creates a full cycle from analysis to actionable improvements.

**How ATS Score Flow Works:**

When a user uploads their resume (PDF or DOCX) through the PublicResumeUploader component, the following process is triggered:

**Resume Parsing:**
The file is sent to the resume parsing function to extract structured information.

**ATS Analysis:**
The parsed data is passed to the ATS analysis service, which evaluates the resume and returns:
- An AI-generated ATS score
- Suggestions for improvement

**Resume Preview:**
The system then displays a preview of how the resume would look in one of our custom templates.

**Continue to Edit:**
If the user clicks the "Continue to Edit" button:
- If logged in, they are redirected to the dashboard and taken to the Modern Resume Editor.
- If not logged in, they are prompted to log in or sign up first.

**Editing & Enhancement (Modern Resume Editor):**
Users can edit resume content, switch templates, and use the "Enhance with AI" feature, which calls an AWS Lambda function to generate improved content.

**Final Output:**
Once editing is done, users can preview and download the resume in PDF format.

---

## **Resume Builder System**

### **4. Comprehensive Resume Creation Platform**

The Resume Builder system provides authenticated users with a full-featured resume creation and editing platform integrated into the dashboard, offering both upload and manual creation workflows.

**Resume Builder Workflow Options:**

**Option 1: Upload Existing Resume** (`ResumeUploader.tsx` → `ResumeBuilderUpload.tsx`)

1. **PDF Upload & Processing**
   - Drag-and-drop or file selection interface for PDF/DOCX files
   - `parse-resume` **AWS LAMBDA** extracts structured data using Adobe PDF Services
   - OpenAI GPT-4 converts raw text to standardized resume format

**Option 2: Manual Resume Creation**

1. **Step-by-Step Input Interface**
   - Section-by-section maunal data filling

2. **AI-Assisted Content Generation**
   - "Enhance with AI" buttons throughout the creation process in summary, work experince and project sections.
   - Context-aware content suggestions

**Modern Resume Editor Features** (`ModernResumeEditor.tsx`)

1. **Advanced Editing Interface**
   - **Three-Panel Layout**: Section editor, resume preview, customization options
   - **Real-time Synchronization**: Instant preview updates as user types
   - **Auto-save Functionality**: Draft preservation in localStorage with conflict resolution
   - **Section Management**: Drag-and-drop reordering and custom section creation

2. **Template Gallery** (`ResumeTemplatePreview.tsx`)
   - **10 Professional Templates**: Standard, Modern, Professional, Minimal, Creative, Chronological, Executive, Technical, Data Scientist, Modern Photo
   - **Template-Aware Rendering**: Dynamic component switching based on selection
   - **Live Template Switching**: Instant preview updates without data loss

3. **Design Customization System**
   - **Color Schemes**: Accent color selection with professional palettes
   - **Typography Options**: Font size variations (small, medium, large)
   - **Spacing Controls**: Compact, normal, and spacious layout options
   - **Template-Specific Settings**: Customization options tailored to each template

4. **AI Enhancement Integration** (`enhance-resume` **AWS LAMBDA**)
   - **Section-Specific Enhancement**: Summary, experience, projects
   - **Content Comparison**: Side-by-side original vs. enhanced content display

5. **Preview & Export System** (`ResumePreview.tsx`)
   - **Full-Page Preview**: Exact representation of final PDF output
   - **PDF Export Functionality**: High-quality PDF generation with proper formatting
   - **Template Switching**: Live template changes in preview mode
   - **Print Optimization**: Proper page breaks and formatting for physical printing

**AWS Lambda Integration in Resume Builder:**

1. **Multi-Stage Content Processing**:
   - Upload workflow → `parse-resume` Lambda extracts and structures PDF content
   - Content creation → `create-resume` Lambda stores resume with user authentication
   - Content enhancement → `enhance-resume` Lambda provides AI-powered improvements
   - Real-time processing with proper error handling 

2. **Advanced PDF Processing Pipeline**:
   - **Adobe PDF Services**: Enterprise-grade text extraction with complex pdf layout handling
   - **OpenAI GPT-4 Structuring**: Intelligent parsing of unstructured resume text
   - **Error Recovery**: Graceful handling of problematic PDFs with user guidance

3. **Intelligent Content Enhancement**:
   - **Context-Aware AI**: Considers user's target role and job description
   - **Professional Language**: Converts casual descriptions to professional resume language
   - **ATS Optimization**:  enhanced content maintains ATS compatibility

**Resume Builder Value Proposition:**

- **Dual Creation Paths**: Upload existing resume or create from scratch with equal functionality
- **AI-Powered Enhancement**: content generation that sounds authentic
- **Professional Templates**: 10 ATS-optimized designs suitable for all industries
- **Advanced Customization**: Design controls while maintaining ATS compatibility
- **Seamless Integration**: Unified experience from creation to final PDF export
- **Enterprise-Grade Processing**: Reliable PDF parsing with Adobe PDF Services
- **User-Friendly Interface**: Intuitive editing experience

**Files Used in Resume Builder System:**

**Frontend Files:**
- `src/components/resume/ResumeUploader.tsx` - PDF upload and parsing interface
- `src/pages/ResumeBuilderUpload.tsx` - Upload workflow management
- `src/pages/ModernResumeEditor.tsx` - Full-featured resume editor
- `src/components/resume/ResumeTemplatePreview.tsx` - Template rendering engine
- `src/pages/ResumePreview.tsx` - Final preview and PDF export
- `src/components/resume/EnhanceWithAI.tsx` - AI content enhancement interface

**AWS Lambda Functions:**
- `aws-lambda-functions/src/parse-resume/index.js` - PDF text extraction and structuring
- `aws-lambda-functions/src/create-resume/index.js` - Resume storage and user account management
- `aws-lambda-functions/src/enhance-resume/index.js` - AI-powered content improvement

**Resume Builder – Overview:**

In the Dashboard > Resume section, users can click on the "Create Resume" button to begin building a resume. They are given two options:

**1. Upload Existing PDF Resume**
- Users can upload their current resume in PDF format.
- The file is processed via our `parse-resume` AWS Lambda function, which extracts relevant information and saves it to the database.
- The extracted content is then auto-filled into our ATS-optimized resume template within the Modern Resume Editor.
- Users can edit the resume, and optionally use the "Enhance with AI" feature (powered by the `enhance-resume` Lambda function) to generate or improve content.
- Once finalized, users can preview and download their resume in PDF format.

**2. Create Manually**
- Users can manually input their resume details step-by-step.
- They can also use the "Enhance with AI" option during input to generate content dynamically.
- The resume is created and edited within the Modern Resume Editor.

**Modern Resume Editor Features:**
- Real-time editing
- AI-powered content generation
- 10 professionally designed templates
- Layout, color, and design customization options
- PDF preview and download

---



### ** Trying to Solve Problem:**
- **Interview Anxiety**: AI-powered practice to build confidence and redunce anxiety
- **Skill Assessment**: Objective feedback helps identify improvement areas  
- **Cost-Effective Preparation**: Accessible alternative to expensive coaching
- **ATS Resume Analysis and building**: AI analysis and resume building 


---

## **Deployment & Testing**

## **Clone and navigate to project**

**git clone [repo-url]**

**cd avatar-interview-boost**

## **Install frontend dependencies**

**npm install**

## **Setup samconfig.toml**
**parameter_overrides** = [
    "CorsOrigins=http://localhost:5173,http://localhost:3000,http://localhost:8080",

   "OpenAIApiKey=${OPENAI_API_KEY}",
    "AdobeClientId=${ADOBE_CLIENT_ID}",
    "AdobeClientSecret=${ADOBE_CLIENT_SECRET}",
    "SupabaseUrl=${SUPABASE_URL}",
    "SupabaseServiceRoleKey=${SUPABASE_SERVICE_ROLE_KEY}"
] 


## **Navigate to Lambda functions and install their dependencies**

**cd aws-lambda-functions**

**npm run build**

## **Build and deploy Lambda functions**

**sam build**

**sam deploy**

## **Run and Test**

**npm run dev**

---

**This submission demonstrates how AWS Lambda can power sophisticated AI applications that solve real-world problems while maintaining cost efficiency and scalability. 
---

