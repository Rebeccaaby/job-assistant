// // app/api/test-agents/route.ts
// import { resumeScorerAgent } from '@/lib/ai/agents/resume-scorer';
// import { answerGeneratorAgent } from '@/lib/ai/agents/answer-generator';
// import { jobScraper } from '@/lib/ai/tools/job-scrapper';

// export async function POST(request: Request) {
//   const { testType } = await request.json();

//   // Sample data for testing
//   const sampleResume = `
//     John Doe
//     Software Engineer
//     john@example.com

//     EXPERIENCE:
//     Senior Developer at Tech Corp (2021-2024)
//     - Built scalable web applications using React and Node.js
//     - Led team of 3 developers
//     - Improved application performance by 40%

//     SKILLS:
//     JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, AWS

//     EDUCATION:
//     BS Computer Science, State University, 2021
//   `.trim();

//   const sampleJobDescription = `
//     Senior Full-Stack Engineer

//     We're looking for an experienced full-stack engineer to join our team.

//     Requirements:
//     - 3+ years of experience with React and Node.js
//     - Strong TypeScript skills
//     - Experience with PostgreSQL
//     - AWS experience preferred
//     - Strong communication skills

//     Responsibilities:
//     - Build and maintain web applications
//     - Collaborate with design team
//     - Mentor junior developers
//   `.trim();

//   const sampleProfile = {
//     name: "John Doe",
//     summary: "Senior software engineer with 3 years of experience",
//     skills: ["JavaScript", "TypeScript", "React", "Node.js", "Python"],
//     workHistory: [
//       {
//         company: "Tech Corp",
//         title: "Senior Developer",
//         startDate: "2021-06",
//         endDate: "2024-01",
//         description: "Built web applications",
//         achievements: ["Improved performance by 40%", "Led team of 3"]
//       }
//     ],
//     education: [
//       {
//         school: "State University",
//         degree: "Bachelor of Science",
//         field: "Computer Science",
//         endDate: "2021-05"
//       }
//     ]
//   };

//   try {
//     if (testType === 'resume-scorer') {
//       console.log("Testing Resume Scorer Agent...");
//       const analysis = await resumeScorerAgent.analyze(
//         sampleResume,
//         sampleJobDescription,
//         sampleProfile
//       );
      
//       return Response.json({
//         success: true,
//         testType: 'resume-scorer',
//         result: analysis
//       });
//     }

//     if (testType === 'answer-generator') {
//       console.log("Testing Answer Generator Agent...");
//       const question = "Why are you a good fit for this role?";
//       const answer = await answerGeneratorAgent.generate(
//         question,
//         sampleJobDescription,
//         sampleProfile
//       );
      
//       return Response.json({
//         success: true,
//         testType: 'answer-generator',
//         result: answer
//       });
//     }

//     if (testType === 'job-scraper') {
//       console.log("Testing Job Scraper...");
//       // Test with LinkedIn job URL (you'll need to provide one)
//       const testUrl = "https://www.linkedin.com/jobs/collections/recommended/?currentJobId=4394730746"; // Replace with real URL
      
//       const jobData = await jobScraper.scrape(testUrl);
      
//       return Response.json({
//         success: true,
//         testType: 'job-scraper',
//         result: jobData
//       });
//     }

//     return Response.json({
//       error: "Invalid test type. Use: 'resume-scorer', 'answer-generator', or 'job-scraper'"
//     }, { status: 400 });

//   } catch (error: any) {
//     return Response.json({
//       success: false,
//       error: error.message
//     }, { status: 500 });
//   }
// }