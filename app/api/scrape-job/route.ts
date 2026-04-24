// app/api/scrape-job/route.ts
import { jobScraper } from '@/lib/ai/tools/job-scrapper';
import { z } from 'zod';

const ScrapeJobSchema = z.object({
  url: z.string().url(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = ScrapeJobSchema.parse(body);

    console.log('Scraping job from:', url);

    const jobData = await jobScraper.scrape(url);

    return Response.json(jobData);

  } catch (error: any) {
    console.error('POST /api/scrape-job error:', error);
    
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid URL', details: error.message },
        { status: 400 }
      );
    }

    return Response.json(
      { error: 'Failed to scrape job posting' },
      { status: 500 }
    );
  }
}