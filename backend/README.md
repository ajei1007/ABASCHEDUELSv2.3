
# Backend (Node.js)

#### Migrate and Sync database:
`yarn db:update`

#### Import SQL dump file:
1. Get `db_abaschedulesv2_3.sql` file.
2. Drop Database: `yarn drop`
3. Import `db_abaschedulesv2_3.sql` file.

#### Start Node.js Server:
`yarn dev`

## Mattermost Chat Integration Setup

This project includes Mattermost integration for chat functionality.
The setup involves Docker Compose services and proper configuration.

### Services Overview
- **mattermost**: Team Edition v10.5 running on port 8065
- **mattermost-db**: PostgreSQL 15 database for Mattermost data

### Initial Setup Steps

#### 1. Start Docker Services
```bash
docker compose up -d mattermost-db mattermost
```

#### 2. Create Mattermost Admin User
1. Navigate to http://localhost:8065
2. Create your first admin account when prompted
3. Set up your initial team and workspace
4. Create Bot/Integration Account (with `admin` access)
5. Copy the generated **Access Token**
6. Fill variables in your `.env` file

**Generate encryption key:**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```
