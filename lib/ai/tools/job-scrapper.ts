import axios from 'axios';
import * as cheerio from 'cheerio';

export interface JobPosting {
  title: string;
  company: string;
  location?: string;
  description: string;
  requirements?: string;
  url: string;
}

export class JobScraper {
  /**
   * Scrape job posting from URL
   * This is a basic scraper 
   */
  async scrape(url: string): Promise<JobPosting> {
    try {
      // Fetch the page
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000,
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract job details
      // These selectors are generic and won't work for all sites
      // You'll need to customize for each job board
      const title = this.extractText($, [
        'h1.job-title',
        'h1[class*="title"]',
        'h1',
        '.job-details-jobs-unified-top-card__job-title'
      ]);

      const company = this.extractText($, [
        '.company-name',
        '[class*="company"]',
        '.job-details-jobs-unified-top-card__company-name'
      ]);

      const location = this.extractText($, [
        '.location',
        '[class*="location"]',
        '.job-details-jobs-unified-top-card__bullet'
      ]);

      // Get description - usually in a div or section
      const description = this.extractText($, [
        '.description',
        '[class*="description"]',
        '#job-details',
        '.jobs-description__content'
      ], true); // true = get full text content

      return {
        title: title || 'Unknown Position',
        company: company || 'Unknown Company',
        location,
        description: description || html.substring(0, 1000), // Fallback to first 1000 chars
        url,
      };
    } catch (error) {
      console.error("Job scraping failed:", error);
      
      // Fallback: return partial data
      return {
        title: 'Could not scrape job title',
        company: 'Could not scrape company',
        description: 'Please paste the job description manually',
        url,
      };
    }
  }

  /**
   * Try multiple CSS selectors and return first match
   */
  private extractText(
    $: cheerio.CheerioAPI,
    selectors: string[],
    fullText = false
  ): string {
    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length) {
        return fullText 
          ? element.text().trim() 
          : element.text().trim().split('\n')[0];
      }
    }
    return '';
  }

  /**
   * Validate if URL looks like a job posting
   */
  isValidJobUrl(url: string): boolean {
    const jobBoardDomains = [
      'linkedin.com/jobs',
      'indeed.com',
      'glassdoor.com',
      'monster.com',
      'ziprecruiter.com',
      'greenhouse.io',
      'lever.co',
      'jobs.ashbyhq.com',
    ];

    return jobBoardDomains.some(domain => url.includes(domain));
  }
}

export const jobScraper = new JobScraper();