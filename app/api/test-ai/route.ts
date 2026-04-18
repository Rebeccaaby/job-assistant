import { testAzureConnection } from '@/lib/ai/test-connection';

export async function GET() {
  const success = await testAzureConnection();
  
  return Response.json({ 
    success,
    message: success ? "AI connection working!" : "Connection failed - check logs"
  });
}