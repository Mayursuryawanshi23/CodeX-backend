# Data Flow Architecture - CodeX Backend

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                             │
│  - Login/SignUp Pages                                            │
│  - Dashboard (Project List)                                      │
│  - Code Editor                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                        HTTP/REST API
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                     │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │           Route Layer (routes/index.js)                     │ │
│  │  - /signUp, /login                                          │ │
│  │  - /createProj, /getProjects, /deleteProject               │ │
│  │  - /getUserData                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │      Controller Layer (controllers/userController.js)       │ │
│  │  - Authentication logic (signUp, login)                     │ │
│  │  - Project management (create, read, update, delete)       │ │
│  │  - JWT token generation & verification                      │ │
│  │  - User data fetching                                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │         Model Layer (models/*.js)                           │ │
│  │  - User.js         → User authentication data               │ │
│  │  - Project.js      → Coding projects                        │ │
│  │  - RUN_JOB.js      → Execution tracking                     │ │
│  │  - RUN_SNAPSHOT.js → Execution outputs                      │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│              MongoDB (NoSQL Database)                             │
│  - Collections: User, Project, RUN_JOB, RUN_SNAPSHOT            │
│  - Indexes on: email, owner_id, updated_at                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Authentication Flow

### SignUp Flow
```
1. User enters: email, password, fullName (Frontend)
   │
   ├→ POST /signUp {email, pwd, fullName}
   │
   ├→ Validate input (not null, email format)
   │
   ├→ Check if email already exists
   │  └→ If YES: Return error "Email already registered"
   │
   ├→ Hash password with bcryptjs (12 salt rounds)
   │
   ├→ Create User document in MongoDB:
   │  {
   │    name: "John Doe",
   │    email: "john@example.com",
   │    password: "$2a$12$...",  // hashed
   │    created_at: 2025-11-17T10:30:00Z,
   │    last_active: 2025-11-17T10:30:00Z
   │  }
   │
   └→ Return: {success: true, userId: "..."}
```

### Login Flow
```
1. User enters: email, password (Frontend)
   │
   ├→ POST /login {email, pwd}
   │
   ├→ Find User by email in MongoDB
   │  └→ If NOT found: Return "User not found"
   │
   ├→ Compare provided password with hashed password
   │  └→ If mismatch: Return "Invalid password"
   │
   ├→ Update user.last_active = new Date()
   │
   ├→ Generate JWT token (expires in 7 days)
   │  token = jwt.sign({userId: user._id}, secret)
   │
   └→ Return: {
        success: true,
        token: "eyJhbGc...",
        user: {id, name, email}
      }
```

---

## Project Management Flow

### Create Project Flow
```
1. User enters: name, description, language (Frontend)
   │
   ├→ POST /createProj {name, description, language, token}
   │
   ├→ Verify JWT token
   │  ├→ Decode token to get userId
   │  ├→ Find User by userId
   │  └→ If NOT found: Return "User not found"
   │
   ├→ Generate startup code based on language
   │
   ├→ Create Project document in MongoDB:
   │  {
   │    owner_id: ObjectId("..."),           // User's ID
   │    name: "My App",
   │    description: "A sample project",
   │    language: "javascript",
   │    code: "console.log('Hello World');",
   │    created_at: 2025-11-17T10:35:00Z,
   │    updated_at: 2025-11-17T10:35:00Z
   │  }
   │
   └→ Return: {success: true, projectId: "...", project: {...}}
```

### Get All Projects Flow
```
1. User clicks "My Projects" (Frontend)
   │
   ├→ POST /getProjects {token}
   │
   ├→ Verify JWT token → Extract userId
   │
   ├→ Query MongoDB:
   │  db.Project.find({owner_id: userId})
   │          .sort({updated_at: -1})
   │          .select('_id name description language created_at updated_at')
   │
   ├→ Return array of projects:
   │  [
   │    {
   │      _id: "...",
   │      name: "Project 1",
   │      description: "Desc",
   │      language: "javascript",
   │      created_at: "...",
   │      updated_at: "..."
   │    },
   │    ...
   │  ]
   │
   └→ Frontend displays in Dashboard
```

### Save Project Code Flow
```
1. User edits code in Editor and clicks "Save"
   │
   ├→ POST /saveProject {token, projectId, code}
   │
   ├→ Verify JWT token → Extract userId
   │
   ├→ Find Project by _id
   │
   ├→ Update Project:
   │  db.Project.findOneAndUpdate(
   │    {_id: projectId},
   │    {code: newCode},
   │    {new: true}  // return updated doc
   │  )
   │
   ├→ Mongoose hook automatically updates:
   │  updated_at: Date.now()
   │
   └→ Return: {success: true, msg: "Project saved successfully"}
```

### Delete Project Flow
```
1. User clicks "Delete" on project (Frontend)
   │
   ├→ User confirms deletion
   │
   ├→ POST /deleteProject {token, projectId}
   │
   ├→ Verify JWT token → Extract userId
   │
   ├→ Delete Project from MongoDB:
   │  db.Project.findOneAndDelete({_id: projectId})
   │
   └→ Return: {success: true}
```

---

## Data Access Pattern - User Isolation

```
Query Pattern: Always filter by user ID

✓ CORRECT - User-isolated
  db.Project.find({owner_id: userId})
  └→ Returns only this user's projects

✗ WRONG - No isolation
  db.Project.find({})
  └→ Returns ALL projects (security issue!)

Implementation:
  exports.getProjects = async (req, res) => {
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({_id: decoded.userId});
    
    // Query filters by user's ID automatically
    let projects = await projectModel.find({owner_id: user._id});
  }
```

---

## Database Query Performance

### Indexes Created
1. **User.email** (Unique)
   - Fast login lookups
   - Prevents duplicate registrations

2. **Project.owner_id**
   - Fast project queries by user
   - Essential for dashboard

3. **Project.updated_at**
   - Sort projects by recency
   - Dashboard displays "Recently Modified" first

### Query Optimization
```javascript
// ✓ GOOD - Selective field selection
db.Project.find({owner_id: userId})
  .select('_id name description language created_at updated_at')
  .sort({updated_at: -1})

// ✗ SLOW - Fetching all fields including large code string
db.Project.find({owner_id: userId})  // includes code field
```

---

## Error Handling Flow

```
Request → Validation → Database → Response

1. INPUT VALIDATION
   ├→ Check required fields
   ├→ Check email format
   ├→ Check password length
   └→ Return 400 Bad Request if invalid

2. AUTHENTICATION
   ├→ Verify JWT token
   ├→ Extract userId
   └→ Return 401 Unauthorized if invalid

3. AUTHORIZATION
   ├→ Check user ownership of resource
   └→ Return 403 Forbidden if not owner

4. DATABASE
   ├→ Try query
   ├→ Catch errors
   └→ Return 500 Internal Server Error

5. SUCCESS
   └→ Return 200 with data
```

---

## Security Measures

### 1. Password Security
- bcryptjs hashing with 12 salt rounds
- Password never stored in plaintext
- Minimum 6 characters enforced

### 2. JWT Authentication
- Token includes userId in payload
- Token expires after 7 days
- Required for all project operations

### 3. User Isolation
- All queries filter by owner_id
- Users can only see/modify their own projects
- Backend enforces access control

### 4. Data Validation
- Email format validation
- Required field validation
- Enum validation for language field

### 5. Database Security
- Unique email constraint
- Foreign key relationships enforced
- Timestamps auto-managed

---

## Future Extensions

### Code Execution Pipeline
```
User submits code
       ↓
Create RUN_JOB {status: "queued"}
       ↓
Code Executor Service (external)
       ↓
Execute code (compile/run)
       ↓
Update RUN_JOB {status: "success"/"failed", output: "..."}
       ↓
Create RUN_SNAPSHOT with output
       ↓
Return to user
```

### Real-time Collaboration
```
User A edits code
       ↓
WebSocket message broadcast
       ↓
User B sees changes instantly
       ↓
All code changes saved to Project.code
```

---

## Summary

✅ **Secure Authentication** - bcryptjs + JWT
✅ **User Isolation** - All queries filter by userId
✅ **Efficient Queries** - Indexed fields, selective data fetching
✅ **Error Handling** - Proper HTTP status codes and messages
✅ **Data Integrity** - Foreign keys, timestamps, validation
✅ **Scalability** - Ready for execution service, real-time features
