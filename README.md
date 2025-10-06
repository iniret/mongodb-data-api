# MongoDB Data API

## Overview
With the deprecation of the Atlas Data API, developers need an alternative solution to interact with MongoDB Atlas clusters via HTTP endpoints without requiring a driver or SDK. This project provides a MongoDB Node.js driver-based API that replicates the functionalities of the Atlas Data API with enhanced type conversion support.

**GitHub Repository:** [mongodb-data-api](https://github.com/iniret/mongodb-data-api)

## Features
- **CRUD Operations**: Supports `insertOne`, `insertMany`, `findOne`, `find`, `updateOne`, `updateMany`, `deleteOne`, `deleteMany`, and `aggregate`.
- **Type Conversion**: Automatically converts MongoDB extended JSON formats (`$date`, `$oid`) and ISO date strings to proper MongoDB types.
- **Security**: Uses API key and secret validation.
- **Rate Limiting**: Protects against abuse with configurable request limits.
- **Logging**: Implements structured logging for debugging and observability.
- **Dynamic Model Handling**: Generates Mongoose models dynamically for different collections.

---

## Prerequisites
- **Node.js**: Install the latest stable version.
- **MongoDB**: Access to a MongoDB cluster or local instance.
- **Environment Variables**: Create a `.env` file with the following keys:

```ini
PORT=7438
MONGO_URI="<MONGO_URI>"
API_KEY="<API_KEY>"
API_SECRET="<API_SECRET>"
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes in milliseconds
RATE_LIMIT_MAX=100 # Max requests per window
RATE_LIMIT_MESSAGE="Too many requests, please try again later."
```

---

## Installation
Clone the repository and install the dependencies:

```sh
git clone https://github.com/iniret/mongodb-data-api.git
cd mongodb-data-api
npm install
```

---

## Project Structure
```bash
mongodb-node-api/
├── index.js
├── .env
├── routes/
│   └── api.js
├── utils/
│   └── logging.js
├── models/
│   └── dynamicModel.js
├── controllers/
│   └── dbController.js
├── package.json
└── vercel.json
```

---

## Setting Up the Server
The server initializes Express, connects to MongoDB, and implements middleware for API authentication, rate limiting, and JSON parsing.

### **Start the Server**
```sh
npm run dev
```

---

## API Endpoints

### Insert One Document
```sh
curl -X POST http://localhost:7438/api/insertOne \
-H "Content-Type: application/json" \
-H "x-api-key: your_api_key_here" \
-H "x-api-secret: your_api_secret_here" \
-d '{
  "database": "sample_db",
  "collection": "sample_collection",
  "document": { "key": "value" }
}'
```

### Find One Document
```sh
curl -X POST http://localhost:7438/api/findOne \
-H "Content-Type: application/json" \
-H "x-api-key: your_api_key_here" \
-H "x-api-secret: your_api_secret_here" \
-d '{
  "database": "sample_db",
  "collection": "sample_collection",
  "filter": { "key": "value" },
  "projection": { "key": 1 }
}'
```

### Find Multiple Documents
```sh
curl -X POST http://localhost:7438/api/find \
-H "Content-Type: application/json" \
-H "x-api-key: your_api_key_here" \
-H "x-api-secret: your_api_secret_here" \
-d '{
  "database": "sample_db",
  "collection": "sample_collection",
  "filter": { "key": "value" },
  "projection": { "key": 1 },
  "sort": { "key": 1 },
  "limit": 10
}'
```

### Update One Document
```sh
curl -X POST http://localhost:7438/api/updateOne \
-H "Content-Type: application/json" \
-H "x-api-key: your_api_key_here" \
-H "x-api-secret: your_api_secret_here" \
-d '{
  "database": "sample_db",
  "collection": "sample_collection",
  "filter": { "key": "value" },
  "update": { "$set": { "key": "new_value" } },
  "upsert": false
}'
```

### Delete One Document
```sh
curl -X POST http://localhost:7438/api/deleteOne \
-H "Content-Type: application/json" \
-H "x-api-key: your_api_key_here" \
-H "x-api-secret: your_api_secret_here" \
-d '{
  "database": "sample_db",
  "collection": "sample_collection",
  "filter": { "key": "value" }
}'
```

### Aggregate Documents
```sh
curl -X POST http://localhost:7438/api/aggregate \
-H "Content-Type: application/json" \
-H "x-api-key: your_api_key_here" \
-H "x-api-secret: your_api_secret_here" \
-d '{
  "database": "sample_db",
  "collection": "sample_collection",
  "pipeline": [
    { "$match": { "key": "value" } },
    { "$group": { "_id": "$key", "count": { "$sum": 1 } } }
  ]
}'
```

---

## Type Conversion

This API automatically handles MongoDB extended JSON formats and converts them to proper MongoDB types:

### Supported Formats
- **ISO Date Strings**: `"2024-01-15T10:30:00.000Z"` → Date object
- **MongoDB $date**: `{"$date": "2024-01-15T10:30:00.000Z"}` → Date object
- **MongoDB $oid**: `{"$oid": "507f1f77bcf86cd799439011"}` → ObjectId

### Example with Extended JSON
```sh
curl -X POST http://localhost:7438/api/insertOne \
-H "Content-Type: application/json" \
-H "x-api-key: your_api_key_here" \
-H "x-api-secret: your_api_secret_here" \
-d '{
  "database": "sample_db",
  "collection": "users",
  "document": {
    "name": "John Doe",
    "createdAt": {"$date": "2024-01-15T10:30:00.000Z"},
    "userId": {"$oid": "507f1f77bcf86cd799439011"}
  }
}'
```

---

## Additional Features
- **Enhanced Logging**: Structured logs for debugging and monitoring.
- **Error Tracking**: Supports integration with monitoring tools.
- **Security Best Practices**: API key authentication and rate limiting.

---

## Disclaimer
- **Not Officially Supported**: This is an independent solution, not maintained by MongoDB.
- **Fix Issues at Your End**: Updates and fixes need to be applied manually.
- **Limited Scope**: Demonstrates basic functionality; requires enhancements for production use.
- **Security Considerations**: Ensure API keys and sensitive data are protected in third-party hosting environments.

---

## License
This project is licensed under the MIT License.

---

## Contributions
Contributions are welcome! Feel free to fork the repository and submit a pull request.

For any queries, reach out via GitHub Issues.

**Original Author:** [Abhishek](https://github.com/abhishekmongoDB)  
**Enhanced by:** [iniret](https://github.com/iniret)
