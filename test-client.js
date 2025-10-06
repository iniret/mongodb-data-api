const https = require('https');
const http = require('http');

// API configuration
const API_URL = 'http://localhost:7438/api/insertOne';
const API_KEY = 'your_api_key_here';
const API_SECRET = 'your_api_secret_here';

function testInsertWithDate() {
    // Create a JavaScript Date object
    const now = new Date();
    const specificDate = new Date('2024-01-15T10:30:00.000Z');

    const payload = {
        database: 'test',
        collection: 'sample',
        document: {
            name: 'Extended JSON Test',
            createdAt: { $date: '2024-01-15T10:30:00.000Z' },  // MongoDB $date format
            userId: { $oid: '507f1f77bcf86cd799439011' },        // MongoDB $oid format
            eventDate: specificDate,                            // JS Date object (becomes ISO string)
            lastLogin: '2024-12-01T14:30:00.000Z',             // ISO string format
            description: 'Test with all supported formats'
        }
    };

    console.log('Sending payload:', JSON.stringify(payload, null, 2));

    const postData = JSON.stringify(payload);

    const options = {
        hostname: 'localhost',
        port: 7438,
        path: '/api/insertOne',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'x-api-secret': API_SECRET,
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                console.log('Response:', JSON.stringify(result, null, 2));

                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log('✅ Success! Document inserted with extended JSON formats');
                } else {
                    console.log('❌ Error:', result);
                }
            } catch (error) {
                console.error('❌ Failed to parse response:', error.message);
                console.log('Raw response:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Request failed:', error.message);
    });

    req.write(postData);
    req.end();
}

// Run the test
testInsertWithDate();