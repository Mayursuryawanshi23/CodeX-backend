# CodeX Backend - Database Schema Documentation

## Overview
The backend follows the database schema specified in the project report, implementing MongoDB with Mongoose ODM.

## Database Collections

### 1. USER Collection
**Purpose**: Store user account information and authentication data

**Fields**:
- `_id` (ObjectId, Primary Key) - Unique identifier
- `name` (String, Required) - User's full name
- `email` (String, Required, Unique) - User's email for login
- `password` (String, Required) - Hashed password (bcryptjs)
- `created_at` (DateTime) - Account creation timestamp
- `last_active` (DateTime) - Last login or activity timestamp

**Relationships**: 
- Referenced by PROJECT (owner_id)
- Referenced by RUN_JOB (user_id)

**Indexes**:
- `email` (Unique) for fast lookups

---

### 2. PROJECT Collection
**Purpose**: Store user coding projects with metadata

**Fields**:
- `_id` (ObjectId, Primary Key) - Unique project identifier
- `owner_id` (ObjectId, Foreign Key → USER._id) - Project owner
- `name` (String, Required) - Project title
- `description` (String) - Short project description
- `code` (String) - Source code content
- `language` (String, Enum) - Programming language
  - Supported: python, java, javascript, cpp, c, go, bash
- `created_at` (DateTime) - Project creation timestamp
- `updated_at` (DateTime) - Last modification timestamp

**Relationships**:
- Foreign Key to USER via `owner_id`
- Referenced by RUN_JOB (project_id)
- Referenced by RUN_SNAPSHOT (project_id)

**Indexes**:
- `owner_id` for efficient user project queries
- `updated_at` for sorting projects by modification time

---

### 3. RUN_JOB Collection
**Purpose**: Track code execution jobs and their status

**Fields**:
- `_id` (ObjectId, Primary Key) - Unique job identifier
- `project_id` (ObjectId, Foreign Key → PROJECT._id) - Associated project
- `user_id` (ObjectId, Foreign Key → USER._id) - User who initiated
- `entry_point` (String) - File or command entry point (default: 'main')
- `status` (String, Enum) - Job status
  - Values: queued, running, success, failed
- `queued_at` (DateTime) - When job was queued
- `started_at` (DateTime) - When execution started
- `finished_at` (DateTime) - When execution completed
- `output` (String) - Standard output from execution
- `error` (String) - Error messages if any

**Relationships**:
- Foreign Key to PROJECT via `project_id`
- Foreign Key to USER via `user_id`
- Referenced by RUN_SNAPSHOT (job_id)

---

### 4. RUN_SNAPSHOT Collection
**Purpose**: Store execution outputs and artifacts

**Fields**:
- `_id` (ObjectId, Primary Key) - Unique snapshot identifier
- `job_id` (ObjectId, Foreign Key → RUN_JOB._id) - Associated job
- `project_id` (ObjectId, Foreign Key → PROJECT._id) - Associated project
- `output_url` (String) - Path to stdout/stderr logs
- `artifact_url` (String) - Path to compiled/built artifacts
- `created_at` (DateTime) - Snapshot creation timestamp

**Relationships**:
- Foreign Key to RUN_JOB via `job_id`
- Foreign Key to PROJECT via `project_id`

---

## API Endpoints

### Authentication
- `POST /signUp` - Create new user account
  - Body: `{ email, pwd, fullName }`
  - Returns: `{ success, msg, userId }`

- `POST /login` - Authenticate user
  - Body: `{ email, pwd }`
  - Returns: `{ success, msg, token, user }`

### User
- `POST /getUserData` - Fetch current user information
  - Body: `{ token }`
  - Returns: `{ success, msg, user }`

### Projects
- `POST /createProj` - Create new project
  - Body: `{ name, description, token, language }`
  - Returns: `{ success, msg, projectId, project }`

- `POST /getProjects` - Fetch all user projects
  - Body: `{ token }`
  - Returns: `{ success, msg, projects, total }`

- `POST /getProject` - Fetch single project
  - Body: `{ token, projectId }`
  - Returns: `{ success, msg, project }`

- `POST /saveProject` - Save project code
  - Body: `{ token, projectId, code }`
  - Returns: `{ success, msg }`

- `POST /editProject` - Update project name
  - Body: `{ token, projectId, name }`
  - Returns: `{ success, msg }`

- `POST /deleteProject` - Delete project
  - Body: `{ token, projectId }`
  - Returns: `{ success, msg }`

---

## Data Flow

### User Registration & Login
1. User signs up with email, password, and name
2. Password hashed with bcryptjs (salt: 12 rounds)
3. User record created with timestamps
4. On login, JWT token generated (expires in 7 days)
5. User's `last_active` updated

### Project Management
1. User creates project with name, description, and language
2. Startup code generated based on language selection
3. Project linked to user via `owner_id`
4. All projects filtered by `owner_id` when fetching
5. `updated_at` automatically updated on any modification

### Code Execution (Future)
1. User submits code for execution
2. RUN_JOB created with `queued` status
3. Job processed, status updated to `running`
4. Upon completion, RUN_SNAPSHOT created with output
5. Status changed to `success` or `failed`

---

## Security Considerations

✅ **Password Hashing**: bcryptjs with 12 salt rounds
✅ **JWT Authentication**: Token-based API authentication
✅ **Email Uniqueness**: Enforced at database level
✅ **Data Validation**: Input validation on all endpoints
✅ **User Isolation**: Projects filtered by user ownership
✅ **Timestamps**: Automatic tracking of creation and modification

---

## Connection String
- MongoDB: `mongodb://127.0.0.1:27017/codeIDE`
- Database: `codeIDE`
