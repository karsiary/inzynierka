# Modify this code to update the DB schema diagram.
# To reset the sample schema, replace everything with
# two dots ('..' - without quotes).

User
-
id PK string
name string
email string UNIQUE
emailVerified datetime
image string
password string

Team
-
id PK int
name string
created_at datetime DEFAULT CURRENT_TIMESTAMP
updated_at datetime DEFAULT CURRENT_TIMESTAMP

Account
-
id PK string
userId string FK >- User.id
type string
provider string
providerAccountId string
refresh_token string NULL
access_token string NULL
expires_at int NULL
token_type string NULL
scope string NULL
id_token string NULL
session_state string NULL
# UNIQUE (provider, providerAccountId)

Session
-
id PK string
sessionToken string UNIQUE
userId string FK >- User.id
expires datetime

VerificationToken
-
identifier string
token string UNIQUE
expires datetime
# UNIQUE (identifier, token)

Project
-
id PK int
name string
description string NULL
status string DEFAULT 'active'
progress float DEFAULT 0
role string DEFAULT 'member'
startDate datetime NULL
endDate datetime NULL
due_date datetime NULL
phase string DEFAULT 'planning'
budgetType string DEFAULT 'global'
budgetGlobal float NULL
budgetPhase1 float NULL
budgetPhase2 float NULL
budgetPhase3 float NULL
budgetPhase4 float NULL
budget_planned float DEFAULT 0
budget_actual float DEFAULT 0
userId string FK >- User.id
created_at datetime DEFAULT CURRENT_TIMESTAMP
updated_at datetime DEFAULT CURRENT_TIMESTAMP

ProjectMember
-
id PK int
projectId int FK >- Project.id
userId string FK >- User.id
role string DEFAULT 'member'
userRoles string NULL
created_at datetime DEFAULT CURRENT_TIMESTAMP
updated_at datetime DEFAULT CURRENT_TIMESTAMP
# UNIQUE (projectId, userId)

ProjectTeam
-
id PK int
projectId int FK >- Project.id
teamId int FK >- Team.id
created_at datetime DEFAULT CURRENT_TIMESTAMP
updated_at datetime DEFAULT CURRENT_TIMESTAMP
# UNIQUE (projectId, teamId)

Song
-
id PK int
title string
status string DEFAULT 'pending'
phase string DEFAULT '1'
projectId int FK >- Project.id
created_at datetime DEFAULT CURRENT_TIMESTAMP
updated_at datetime DEFAULT CURRENT_TIMESTAMP

SongAuthor
-
id PK int
songId int FK >- Song.id
userId string FK >- User.id NULL
teamId int FK >- Team.id NULL
type string
created_at datetime DEFAULT CURRENT_TIMESTAMP
updated_at datetime DEFAULT CURRENT_TIMESTAMP

Task
-
id PK int
title string
description string NULL
status string DEFAULT 'todo'
priority string DEFAULT 'Średni'
start_date datetime NULL
end_date datetime NULL
due_date datetime NULL
phase_id string
project_id int FK >- Project.id
song_id int FK >- Song.id NULL
created_by string FK >- User.id
responsible_user string FK >- User.id NULL
planned_budget float NULL
actual_budget float NULL
activityType string NULL
created_at datetime DEFAULT CURRENT_TIMESTAMP
updated_at datetime DEFAULT CURRENT_TIMESTAMP

TaskComment
-
id PK int
content string
taskId int FK >- Task.id
userId string FK >- User.id
created_at datetime DEFAULT CURRENT_TIMESTAMP
updated_at datetime DEFAULT CURRENT_TIMESTAMP

TaskChecklistItem
-
id PK int
content string
isCompleted boolean DEFAULT false
taskId int FK >- Task.id
created_at datetime DEFAULT CURRENT_TIMESTAMP
updated_at datetime DEFAULT CURRENT_TIMESTAMP

TaskAssignee
-
id PK int
taskId int FK >- Task.id
userId string FK >- User.id
created_at datetime DEFAULT CURRENT_TIMESTAMP
updated_at datetime DEFAULT CURRENT_TIMESTAMP
# UNIQUE (taskId, userId)

Activity
-
id PK int
type string
description string
userId string FK >- User.id
created_at datetime DEFAULT CURRENT_TIMESTAMP

TeamMember
-
id PK int
teamId int FK >- Team.id
userId string FK >- User.id
role string DEFAULT 'member'
created_at datetime DEFAULT CURRENT_TIMESTAMP
updated_at datetime DEFAULT CURRENT_TIMESTAMP
# UNIQUE (teamId, userId)

Notification
-
id PK int
userId string FK >- User.id
type string CHECK (type IN ('TEAM_INVITE','PROJECT_INVITE','TASK_ASSIGNMENT','TASK_COMMENT'))
title string
message string
targetId string NULL
actionUrl string NULL
isRead boolean DEFAULT false
createdAt datetime DEFAULT CURRENT_TIMESTAMP 