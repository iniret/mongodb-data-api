/**
 * Cloudflare Worker function for beacon tracking
 * Uses MongoDB Data API for database operations
 */
export default {
    async fetch(request, env) {
        // CORS headers for preflight requests
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            const result = await handleBeacon(request, env);
            return new Response(JSON.stringify(result), {
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            });
        } catch (error) {
            console.error('Beacon error:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            });
        }
    }
};

async function handleBeacon(request, env) {
    const dbName = "aws";
    const statsCollName = "statistics";
    const defaultType = "faq";

    // Extract data from request
    let data = {};

    if (request.method === 'POST') {
        try {
            const contentType = request.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await request.json();
            } else {
                const text = await request.text();
                data = text ? JSON.parse(text) : {};
            }
        } catch (e) {
            // If parsing fails, use empty object
            data = {};
        }
    } else if (request.method === 'GET') {
        // Extract query parameters
        const url = new URL(request.url);
        data = Object.fromEntries(url.searchParams);
    }

    // Handle empty data
    if (!data || Object.keys(data).length === 0) {
        data = { type: defaultType };
    }

    // Ensure 'type' has a default value
    data.type = data.type || defaultType;

    // Add the time of the event
    data.eventTime = new Date().toISOString();

    // Extract and add headers (excluding sensitive ones)
    const headers = {};
    const allowedHeaders = [
        'user-agent', 'referer', 'accept-language',
        'cf-ray', 'cf-ipcountry', 'cf-connecting-ip'
    ];

    for (const [key, value] of request.headers.entries()) {
        if (allowedHeaders.includes(key.toLowerCase())) {
            headers[key] = value;
        }
    }
    data.headers = headers;

    // Add Cloudflare specific data if available
    if (request.cf) {
        data.cf = {
            country: request.cf.country,
            city: request.cf.city,
            timezone: request.cf.timezone,
            asn: request.cf.asn
        };
    }

    // Save to MongoDB using Data API
    const insertResult = await insertToMongoDB(env, dbName, statsCollName, data);

    // Optional: Send notification (uncomment if needed)
    // await sendNotification(data);

    return { success: "Event saved in 'statistics' collection!", id: insertResult.insertedId };
}

async function insertToMongoDB(env, database, collection, document) {
    const dataApiUrl = env.DATA_API_URL || 'http://localhost:7438';
    const apiKey = env.API_KEY;

    if (!apiKey) {
        throw new Error('API_KEY environment variable is required');
    }

    const response = await fetch(`${dataApiUrl}/api/insertOne`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            database,
            collection,
            document
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`MongoDB Data API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
}

// Optional notification function (uncomment if needed)
/*
async function sendNotification(data) {
  try {
    await fetch('https://ntfy.sh/allwomenstalk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: JSON.stringify(data, null, 2)
      })
    });
  } catch (error) {
    console.error('Notification error:', error);
  }
}
*/
