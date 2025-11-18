import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Health check endpoint for diagnosing API configuration
 * WARNING: Does NOT expose any secrets (API keys, tokens, etc.)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const checks = {
      timestamp: new Date().toISOString(),
      environment: {
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        nodeVersion: process.version,
        platform: process.platform,
      },
      imports: {
        canImportOpenAI: false,
        canImportTypes: false,
        canImportServices: false,
      },
      openai: {
        status: 'not_tested',
        error: null as string | null,
      },
    };

    // Test imports
    try {
      await import('openai');
      checks.imports.canImportOpenAI = true;
    } catch (e: any) {
      console.error('Failed to import openai:', e.message);
    }

    try {
      await import('../src/types');
      checks.imports.canImportTypes = true;
    } catch (e: any) {
      console.error('Failed to import types:', e.message);
    }

    try {
      await import('../src/services/openai');
      checks.imports.canImportServices = true;
    } catch (e: any) {
      console.error('Failed to import services:', e.message);
    }

    // Test OpenAI connection (if key exists)
    if (process.env.OPENAI_API_KEY) {
      try {
        const OpenAI = (await import('openai')).default;
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // Minimal API call to test connection
        await client.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5,
        });

        checks.openai.status = 'connected';
      } catch (error: any) {
        checks.openai.status = 'failed';
        checks.openai.error = error.message || 'Unknown error';
        console.error('OpenAI connection test failed:', error.message);
      }
    } else {
      checks.openai.status = 'no_api_key';
      checks.openai.error = 'OPENAI_API_KEY environment variable not set';
    }

    return res.status(200).json({
      success: true,
      checks,
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Health check failed',
    });
  }
}
