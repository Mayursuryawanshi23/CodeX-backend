# Backend Setup & Deployment Guide

## Prerequisites

### Required Software
- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** (comes with Node.js)

### Installation Steps

1. **Install Node.js & npm**
   ```bash
   # Windows: Download from https://nodejs.org/
   # Verify installation
   node --version
   npm --version
   ```

2. **Install MongoDB**
   ```bash
   # Windows: Download from https://www.mongodb.com/try/download/community
   # Start MongoDB service
   # MongoDB runs on: mongodb://127.0.0.1:27017
   ```

3. **Start MongoDB Server**
   ```bash
   # On Windows, MongoDB should run as a service automatically
   # Or run: mongod
   ```

---

## Backend Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

This installs all required packages:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cors` - Cross-origin requests
- And more...

### Step 2: Verify MongoDB Connection
```bash
# MongoDB should be running on localhost:27017
# Database name: codeIDE

# Verify in app.js:
# const connectDB = require('./config/db');
# connectDB();  ← This connects to MongoDB
```

Connection string: `mongodb://127.0.0.1:27017/codeIDE`

### Step 3: Start Backend Server
```bash
npm start
```

Expected output:
```
MongoDB connected
Express server running on port 3000
```

Server runs on: `http://localhost:3000`

---

## Environment Configuration

### app.js Configuration
```javascript
// Current settings
const PORT = 3000;
const DATABASE = 'mongodb://127.0.0.1:27017/codeIDE'

// Modify if needed:
// - Change PORT for different port
// - Update DATABASE URL for remote MongoDB
```

### JWT Secret
```javascript
// In controllers/userController.js
const secret = "secret";

// ⚠️ IN PRODUCTION: Use environment variable
// const secret = process.env.JWT_SECRET;
```

---

## API Endpoints Reference

### Base URL
```
http://localhost:3000
```

### Authentication Endpoints

#### SignUp
```http
POST /signUp
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "pwd": "password123"
}

Response: {success: true, userId: "..."}
```

#### Login
```http
POST /login
Content-Type: application/json

{
  "email": "john@example.com",
  "pwd": "password123"
}

Response: {
  success: true,
  token: "eyJhbGc...",
  user: {id, name, email}
}
```

### User Endpoints

#### Get User Data
```http
POST /getUserData
Content-Type: application/json

{
  "token": "eyJhbGc..."
}

Response: {
  success: true,
  user: {_id, name, email, created_at, last_active}
}
```

### Project Endpoints

#### Create Project
```http
POST /createProj
Content-Type: application/json

{
  "name": "My First App",
  "description": "A sample JavaScript project",
  "language": "javascript",
  "token": "eyJhbGc..."
}

Response: {
  success: true,
  projectId: "...",
  project: {...}
}
```

#### Get All Projects
```http
POST /getProjects
Content-Type: application/json

{
  "token": "eyJhbGc..."
}

Response: {
  success: true,
  projects: [...],
  total: 5
}
```

#### Get Single Project
```http
POST /getProject
Content-Type: application/json

{
  "token": "eyJhbGc...",
  "projectId": "507f1f77bcf86cd799439011"
}

Response: {
  success: true,
  project: {...}
}
```

#### Save Project Code
```http
POST /saveProject
Content-Type: application/json

{
  "token": "eyJhbGc...",
  "projectId": "507f1f77bcf86cd799439011",
  "code": "console.log('Hello World');"
}

Response: {success: true}
```

#### Edit Project
```http
POST /editProject
Content-Type: application/json

{
  "token": "eyJhbGc...",
  "projectId": "507f1f77bcf86cd799439011",
  "name": "Updated Project Name"
}

Response: {success: true}
```

#### Delete Project
```http
POST /deleteProject
Content-Type: application/json

{
  "token": "eyJhbGc...",
  "projectId": "507f1f77bcf86cd799439011"
}

Response: {success: true}
```

---

## Testing with cURL

### 1. SignUp Test
```bash
curl -X POST http://localhost:3000/signUp \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","email":"john@test.com","pwd":"password123"}'
```

### 2. Login Test
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","pwd":"password123"}'

# Copy the token from response
```

### 3. Create Project Test
```bash
curl -X POST http://localhost:3000/createProj \
  -H "Content-Type: application/json" \
  -d '{"name":"My App","description":"Test project","language":"javascript","token":"YOUR_TOKEN_HERE"}'
```

### 4. Get Projects Test
```bash
curl -X POST http://localhost:3000/getProjects \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN_HERE"}'
```

---

## Testing with Postman

1. **Create Collection**: "CodeX API"
2. **Add Requests**:
   - SignUp (POST)
   - Login (POST)
   - Create Project (POST)
   - Get Projects (POST)
   - etc.

3. **Use Postman Variables**:
   ```
   {{baseUrl}} = http://localhost:3000
   {{token}} = saved from login response
   ```

---

## Debugging

### Check MongoDB Connection
```bash
# Connect to MongoDB
mongo

# Select database
use codeIDE

# View collections
show collections

# View documents
db.User.find()
db.Project.find()
```

### Enable Logging
```javascript
// In app.js, add:
app.use(logger('dev'));  // Already enabled

// Shows all HTTP requests
```

### Check Errors
```bash
# Look for error messages in console
# Common errors:
# - "MongoDB connected" missing = Connection failed
# - "Cannot find module" = Missing npm install
# - "Address already in use" = Port 3000 in use
```

---

## Production Deployment

### Environment Variables
Create `.env` file:
```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://YOUR_REMOTE_DB_URL
JWT_SECRET=your_very_secret_key_here
```

### Update app.js
```javascript
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const DB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
```

### Install dotenv
```bash
npm install dotenv
```

### Deploy to Cloud
Options:
- Heroku
- AWS (EC2, Lambda)
- DigitalOcean
- Azure
- Google Cloud

---

## Troubleshooting

### Issue: "MongoDB connected" not showing
**Solution**: Start MongoDB service
```bash
# On Windows
net start MongoDB
# Or run mongod in separate terminal
```

### Issue: "Cannot find module 'mongoose'"
**Solution**: Install dependencies
```bash
npm install
```

### Issue: Port 3000 already in use
**Solution**: Use different port
```bash
# In app.js or via environment
PORT=3001 npm start
```

### Issue: CORS errors
**Solution**: Already enabled in app.js
```javascript
app.use(cors());  // Already configured
```

### Issue: JWT token expired
**Solution**: User needs to re-login
```
Token expires in 7 days
Frontend should handle login redirect
```

---

## Performance Optimization

### Database Indexes
Already created on:
- `User.email` (unique)
- `Project.owner_id`
- `Project.updated_at`

### Query Optimization
- Selective field selection in getProjects
- Sorted by updated_at (most recent first)
- Proper use of MongoDB queries

### Caching (Future)
```javascript
// Consider adding Redis for:
// - JWT token caching
// - Project list caching
// - User session management
```

---

## Security Checklist

✅ Passwords hashed with bcryptjs (12 rounds)
✅ JWT tokens expire (7 days)
✅ Email uniqueness enforced
✅ User isolation (owner_id checks)
✅ Input validation on all endpoints
✅ CORS enabled
✅ HTTP errors properly returned

### Before Production:
- [ ] Change JWT_SECRET to strong random string
- [ ] Move to remote MongoDB with authentication
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Add request logging
- [ ] Set NODE_ENV=production
- [ ] Use environment variables

---

## Quick Start Summary

```bash
# 1. Prerequisites
# - Node.js installed
# - MongoDB running

# 2. Install backend
cd backend
npm install

# 3. Start backend
npm start

# 4. Test endpoints
curl -X POST http://localhost:3000/signUp ...

# 5. Frontend integration
# Update api_base_url in frontend/src/helper.js to http://localhost:3000
```

---

## Support & Documentation

For more details, see:
- `DATABASE_SCHEMA.md` - Complete schema
- `DATA_FLOW.md` - Architecture and flows
- `QUICK_REFERENCE.md` - API endpoints reference
- `IMPLEMENTATION_SUMMARY.md` - Implementation details

---

## Success Indicators

✅ Backend starts without errors
✅ "MongoDB connected" in console
✅ Can create user account
✅ Can login and get token
✅ Can create projects
✅ Can list user projects
✅ Frontend connects to backend

You're ready to go! 🚀
