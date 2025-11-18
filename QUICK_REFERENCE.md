# Backend Quick Reference

## Environment Setup

### MongoDB Connection
- **URI**: `mongodb://127.0.0.1:27017/codeIDE`
- **Database**: `codeIDE`
- Location: `config/db.js`

### Start Backend Server
```bash
cd backend
npm start
# Server runs on: http://localhost:3000
```

---

## Schema Overview

### Collections Created
1. **User** - User accounts and authentication
2. **Project** - Coding projects (linked to users)
3. **RUN_JOB** - Code execution tracking
4. **RUN_SNAPSHOT** - Execution outputs and artifacts

---

## Key Field Mappings

| Entity | Old Field | New Field | Note |
|--------|-----------|-----------|------|
| User | fullName | name | Matches report |
| User | date | created_at, last_active | Separate timestamps |
| Project | createdBy | owner_id | Foreign key reference |
| Project | projLanguage | language | Cleaner naming |
| Project | date | created_at, updated_at | Auto-update on modifications |
| Project | — | description | New field from report |

---

## Endpoint Reference

### Authentication
| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| POST | /signUp | email, pwd, fullName | success, userId |
| POST | /login | email, pwd | success, token, user |

### User
| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| POST | /getUserData | token | success, user |

### Projects
| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| POST | /createProj | name, description, language, token | success, projectId, project |
| POST | /getProjects | token | success, projects, total |
| POST | /getProject | token, projectId | success, project |
| POST | /saveProject | token, projectId, code | success |
| POST | /editProject | token, projectId, name | success |
| POST | /deleteProject | token, projectId | success |

---

## Important Notes

✅ **Password Security**: bcryptjs with 12 salt rounds
✅ **JWT Expiry**: 7 days from login
✅ **Email**: Case-insensitive, unique constraint
✅ **Timestamps**: Automatic on creation/modification
✅ **User Isolation**: All projects filtered by owner_id

---

## Test API Endpoints

### Example: SignUp → Login → Create Project

```javascript
// 1. SignUp
fetch('http://localhost:3000/signUp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'John Doe',
    email: 'john@example.com',
    pwd: 'password123'
  })
})

// 2. Login
fetch('http://localhost:3000/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    pwd: 'password123'
  })
})
// Save token from response

// 3. Create Project
fetch('http://localhost:3000/createProj', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My App',
    description: 'My first project',
    language: 'javascript',
    token: 'saved_token_here'
  })
})
```

---

## Folder Structure

```
backend/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   └── userController.js        # All business logic
├── models/
│   ├── userModel.js             # User schema
│   ├── projectModel.js          # Project schema
│   ├── runJobModel.js           # RUN_JOB schema (NEW)
│   └── runSnapshotModel.js      # RUN_SNAPSHOT schema (NEW)
├── routes/
│   └── index.js                 # API routes
├── app.js                       # Express app setup
├── DATABASE_SCHEMA.md           # Full schema documentation
└── IMPLEMENTATION_SUMMARY.md    # Implementation details
```

---

## Common Errors & Solutions

### 1. "Email already exist"
- User already registered with this email
- Solution: Use different email or login

### 2. "Invalid password"
- Password doesn't match
- Solution: Verify password is correct

### 3. "User not found"
- Token is invalid or expired
- Solution: Re-login to get new token

### 4. "Project not found"
- projectId doesn't exist
- Solution: Verify projectId from getProjects endpoint

---

## Future Enhancements (Roadmap)

- [ ] RUN_JOB execution engine integration
- [ ] RUN_SNAPSHOT artifact storage
- [ ] Code compilation and execution
- [ ] Real-time code collaboration
- [ ] Version control integration
- [ ] Advanced error logging
