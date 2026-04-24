// // lib/resume-parser.ts
// import pdf from 'pdf-parse';

// interface ParsedResume {
//   summary: string;
//   skills: string[];
//   workHistory: Array<{
//     company: string;
//     title: string;
//     startDate: string;
//     endDate: string;
//     description: string;
//     achievements: string[];
//   }>;
//   education: Array<{
//     school: string;
//     degree: string;
//     field: string;
//     endDate: string;
//   }>;
//   rawText: string;
// }

// export async function parseResumePDF(buffer: Buffer): Promise<ParsedResume> {
//   // Extract text from PDF
//   const data = await pdf(buffer);
//   const text = data.text;

//   // Parse using AI (we'll use the LLM to structure the data)
//   return {
//     rawText: text,
//     summary: "",
//     skills: [],
//     workHistory: [],
//     education: [],
//   };
// }

// export async function parseResumeWithAI(resumeText: string): Promise<Omit<ParsedResume, 'rawText'>> {
//   // This will use our LLM to extract structured data
//   const systemPrompt = `You are a resume parser. Extract structured information from resumes.

//     Return ONLY valid JSON in this exact format:
//     {
//     "summary": "brief professional summary extracted from resume",
//     "skills": ["skill1", "skill2", ...],
//     "workHistory": [
//         {
//         "company": "Company Name",
//         "title": "Job Title",
//         "startDate": "YYYY-MM",
//         "endDate": "YYYY-MM or Present",
//         "description": "what they did",
//         "achievements": ["achievement 1", "achievement 2"]
//         }
//     ],
//     "education": [
//         {
//         "school": "University Name",
//         "degree": "Degree Type",
//         "field": "Field of Study",
//         "endDate": "YYYY-MM"
//         }
//     ]
//     }`;

//   const userPrompt = `Parse this resume and extract structured information:\n\n${resumeText}`;

//   try {
//     const response = await fetch('/api/parse-resume', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ resumeText }),
//     });

//     if (!response.ok) {
//       throw new Error('Failed to parse resume');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Resume parsing failed:', error);
//     // Return empty structure on failure
//     return {
//       summary: "",
//       skills: [],
//       workHistory: [],
//       education: [],
//     };
//   }
// }