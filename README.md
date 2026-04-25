# AI-Powered Job Application Assistant

An intelligent job application platform that uses AI to help job seekers save time and improve their applications. Features three core AI agents: Resume Parser, Resume-to-JD Scorer, and Tailored Answer Generator.

## Features

- **AI Resume Parser**: Paste your resume text and AI auto-fills your profile in seconds
- **Resume-to-JD Scorer**: Analyzes how well your resume matches a job description (0-100 score)
- **Tailored Answer Generator**: Creates personalized answers to application questions using STAR method
- **Application Dashboard**: Track all your job applications in one place with status updates

## Tech Stack

- **Frontend**: Next.js 16.2.3, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 5.22.0
- **AI**: Azure OpenAI (DeepSeek R1)

## Prerequisites

Before you begin, make sure you have:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Supabase account** for PostgreSQL database ([Sign up](https://supabase.com/))
- **Azure OpenAI account** with DeepSeek R1 deployment ([Azure Portal](https://portal.azure.com/))

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` manually with the following variables:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://<user>:<password>@host:5432/database"

# Azure OpenAI
AZURE_OPENAI_API_KEY="your-azure-openai-api-key"
AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"  (use yout endpoint from the model)
AZURE_OPENAI_DEPLOYMENT_NAME="DeepSeek-R1"
AZURE_OPENAI_API_VERSION="2024-08-01-preview"
```

#### How to Get These Credentials:

**Supabase Database URL:**
1. Go to [Supabase](https://supabase.com/) and create a new project
2. Navigate to **Settings** → **Database**
3. Copy the **Connection String** (URI format)
4. Replace `[YOUR-PASSWORD]` with your database password

**Azure OpenAI:**
1. Go to [Azure Portal](https://portal.azure.com/)
2. Create an **Azure OpenAI** resource
3. Deploy the **DeepSeek R1** model
4. Go to **Keys and Endpoint** to get your API key and endpoint

### 3. Set Up the Database

Run Prisma migrations to create database tables:

```bash
npx prisma migrate dev
```

### 4. Seed the Database

Create the test user and initial profile, run:

```bash
npx prisma db seed
```
You should see:
🌱 Seeding database...
Created user: test-user-mvp
Created profile for user: test-user-mvp
Seeding completed!

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the app.

## Using the App

### 1. **Create Your Profile**

Visit [http://localhost:3000/profile](http://localhost:3000/profile)

**Option A: AI Resume Parser (Recommended)**
- Copy your entire resume text from any source (Word or PDF)
- Paste it into the text box
- Click "Parse Resume with AI"
- Watch as AI auto-fills all your profile fields in 30 seconds to 1 minute

**Option B: Manual Entry**
- Fill out each section manually (summary, skills, work history, education)

Click "Save Profile" when done.

### 2. **Analyze Job Fit**

Visit [http://localhost:3000/analyze](http://localhost:3000/analyze)

- Paste a job title and company name
- Paste the full job description
- Click "Analyze Match"
- Get an AI-generated match score (0-100) with:
  - **Strengths**: What makes you a good fit
  - **Gaps**: Areas where you might be missing requirements
  - **Recommendations**: How to improve your resume for this job

### 3. **Track Applications**

Visit [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

- View all your analyzed job applications
- Update application status (Not Submitted → Interview → Offer)
- See analytics (response rate, interview rate)
- Export your applications to CSV

### 4. **Generate Tailored Answers**

Click on any application in the dashboard to view details, then:

- Type a common interview question (e.g., "Why are you a good fit for this role?")
- Click "Generate Answer"
- AI creates a personalized, STAR-method response using your profile
- Copy and use in your applications


## Common Issues & Troubleshooting

### Issue: "Cannot find module '@prisma/client'"

**Solution:**
```bash
npx prisma generate
```

### Issue: "Profile not found" or 404 errors

**Solution:**
```bash
# Reset database and reseed
npx prisma migrate reset
npx prisma db seed
```

### Issue: Server won't start or cache issues

**Solution:**
```bash
# Clear Next.js cache
rmdir /s /q .next       # Windows
rm -rf .next            # Mac/Linux

# Restart server
npm run dev
```

### Issue: AI parsing fails or returns errors

**Causes:**
- Invalid Azure OpenAI credentials
- DeepSeek R1 model not deployed
- Rate limits exceeded

**Solution:**
1. Verify your `.env` file has correct credentials
2. Check Azure Portal that DeepSeek R1 is deployed
3. Wait a minute if you hit rate limits

### Issue: Database connection fails

**Solution:**
1. Check your `DATABASE_URL` in `.env`
2. Verify Supabase project is active
3. Make sure password is correct (no special URL encoding needed)

## Database Schema

```prisma
model User {
  id          String        @id @default(uuid())
  email       String        @unique
  name        String?
  phone       String?
  profile     Profile?
  applications Application[]
}

model Profile {
  userId       String   @id
  user         User     @relation(fields: [userId], references: [id])
  summary      String   @default("")
  skills       String[]
  workHistory  Json[]
  education    Json[]
  resumeText   String   @default("")
}

model Application {
  id                  String            @id @default(uuid())
  userId              String
  user                User              @relation(fields: [userId], references: [id])
  jobTitle            String
  company             String
  jobUrl              String?
  jobDescription      String
  status              ApplicationStatus @default(NOT_SUBMITTED)
  matchScore          Int?
  strengths           String[]
  gaps                String[]
  recommendations     String[]
  tailoredAnswers     Json?
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
}

enum ApplicationStatus {
  NOT_SUBMITTED
  SUBMITTED
  INITIAL_RESPONSE
  INTERVIEW_REQUESTED
  REJECTED_AFTER_APPLY
  REJECTED_AFTER_INTERVIEW
  ONSITE_REQUESTED
  OFFER_RECEIVED
}
```

## Security Notes

- Never commit your `.env` file to Git (it's in `.gitignore`)
- Each user needs their own database and API keys
- Your data is stored in your own Supabase database (not shared)
- Keep your Azure OpenAI API keys secure

## Testing

The app uses a hardcoded test user (`test-user-mvp`) for MVP purposes. In production, you would implement proper authentication.

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma generate  # Generate Prisma Client
npx prisma migrate dev # Run migrations
npx prisma db seed   # Seed database
```

## Demo

For a full demo of the application, see the demo video: [Add your demo video link]


## References

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database by [Supabase](https://supabase.com/)
- AI powered by [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service)
