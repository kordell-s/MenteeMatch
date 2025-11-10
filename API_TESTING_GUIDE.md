# Roadmap API Testing Guide

## Quick Start - Test the APIs

You can test these APIs using:
- **Postman** (recommended)
- **curl** commands
- **Your browser** (for GET requests)
- **Next.js API Routes tester**

---

## Prerequisites

1. **Authentication**: You need to be logged in as a mentor to create roadmaps
2. **Mentorship**: You need an active mentorship (status: ACCEPTED)
3. **Database**: PostgreSQL running with migrations applied

---

## Test Sequence

### 1. Create a Roadmap

```bash
POST http://localhost:3000/api/roadmaps
Content-Type: application/json

{
  "mentorshipId": "YOUR_MENTORSHIP_ID",
  "title": "Full-Stack Development Journey",
  "description": "A comprehensive 8-week program to master full-stack development",
  "duration": 8,
  "focusArea": "Full-Stack Development",
  "milestones": [
    {
      "title": "Week 1-2: Frontend Fundamentals",
      "description": "Learn HTML, CSS, and JavaScript basics",
      "dueDate": "2025-11-24T00:00:00Z"
    },
    {
      "title": "Week 3-4: React Mastery",
      "description": "Build interactive UIs with React",
      "dueDate": "2025-12-08T00:00:00Z"
    },
    {
      "title": "Week 5-6: Backend with Node.js",
      "description": "Create RESTful APIs and databases",
      "dueDate": "2025-12-22T00:00:00Z"
    },
    {
      "title": "Week 7-8: Full-Stack Project",
      "description": "Build and deploy a complete application",
      "dueDate": "2026-01-05T00:00:00Z"
    }
  ]
}
```

**Expected Response:**
```json
{
  "message": "Roadmap created successfully",
  "roadmap": {
    "id": "roadmap-uuid",
    "title": "Full-Stack Development Journey",
    "duration": 8,
    "status": "ACTIVE",
    "milestones": [ ... ]
  }
}
```

---

### 2. Get All Roadmaps

```bash
GET http://localhost:3000/api/roadmaps
```

**With filters:**
```bash
# Get roadmaps for specific mentorship
GET http://localhost:3000/api/roadmaps?mentorshipId=YOUR_MENTORSHIP_ID

# Get only active roadmaps
GET http://localhost:3000/api/roadmaps?status=ACTIVE

# Get templates only
GET http://localhost:3000/api/roadmaps?isTemplate=true
```

---

### 3. Get Specific Roadmap with Progress

```bash
GET http://localhost:3000/api/roadmaps/[roadmapId]
```

**Expected Response:**
```json
{
  "id": "roadmap-uuid",
  "title": "Full-Stack Development Journey",
  "milestones": [ ... ],
  "progress": {
    "milestones": {
      "total": 4,
      "completed": 1,
      "percentage": 25
    },
    "tasks": {
      "total": 12,
      "completed": 5,
      "percentage": 42
    }
  }
}
```

---

### 4. Add a Milestone

```bash
POST http://localhost:3000/api/roadmaps/[roadmapId]/milestones
Content-Type: application/json

{
  "title": "Bonus: Advanced TypeScript",
  "description": "Deep dive into TypeScript advanced features",
  "dueDate": "2026-01-12T00:00:00Z",
  "order": 5
}
```

---

### 5. Update Milestone Status

```bash
PATCH http://localhost:3000/api/milestones/[milestoneId]
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

**Status options:** `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`

---

### 6. Add a Resource to Milestone

```bash
POST http://localhost:3000/api/milestones/[milestoneId]/resources
Content-Type: application/json

{
  "title": "React Official Documentation",
  "url": "https://react.dev",
  "description": "Official React docs - great for learning hooks",
  "resourceType": "LINK"
}
```

**Resource types:** `LINK`, `VIDEO`, `ARTICLE`, `DOCUMENT`, `OTHER`

---

### 7. Schedule a Check-In

```bash
POST http://localhost:3000/api/milestones/[milestoneId]/check-ins
Content-Type: application/json

{
  "scheduledDate": "2025-11-20T14:00:00Z",
  "mentorNotes": "Let's review progress on React components",
  "createSession": true
}
```

**Note:** `createSession: true` will automatically create a Session linked to this check-in.

---

### 8. Complete a Check-In

```bash
POST http://localhost:3000/api/check-ins/[checkInId]/complete
Content-Type: application/json

{
  "mentorNotes": "Great progress! React components look solid.",
  "menteeNotes": "I'm more confident with hooks now. Ready for next milestone!"
}
```

---

### 9. Save Roadmap as Template

```bash
POST http://localhost:3000/api/roadmaps/templates
Content-Type: application/json

{
  "roadmapId": "existing-roadmap-uuid",
  "templateName": "Full-Stack Development Template"
}
```

---

### 10. Create Roadmap from Template

```bash
POST http://localhost:3000/api/roadmaps/from-template
Content-Type: application/json

{
  "templateId": "template-roadmap-uuid",
  "mentorshipId": "target-mentorship-uuid",
  "title": "Custom Full-Stack Journey",
  "startDate": "2025-12-01T00:00:00Z"
}
```

---

## Common Test Scenarios

### Scenario 1: Complete Mentorship Journey

```bash
# 1. Create roadmap
POST /api/roadmaps
{ ... roadmap data ... }

# 2. Get first milestone ID from response
GET /api/roadmaps/[roadmapId]

# 3. Add resources to first milestone
POST /api/milestones/[milestoneId]/resources
{ "title": "...", "url": "..." }

# 4. Schedule check-in
POST /api/milestones/[milestoneId]/check-ins
{ "scheduledDate": "...", "createSession": true }

# 5. Mark milestone as in progress
PATCH /api/milestones/[milestoneId]
{ "status": "IN_PROGRESS" }

# 6. Complete check-in
POST /api/check-ins/[checkInId]/complete
{ "mentorNotes": "...", "menteeNotes": "..." }

# 7. Mark milestone as completed
PATCH /api/milestones/[milestoneId]
{ "status": "COMPLETED" }

# 8. Check overall progress
GET /api/roadmaps/[roadmapId]
```

---

### Scenario 2: Template Workflow

```bash
# 1. Create a great roadmap
POST /api/roadmaps
{ ... }

# 2. Save it as template
POST /api/roadmaps/templates
{ "roadmapId": "...", "templateName": "My Template" }

# 3. List all templates
GET /api/roadmaps/templates

# 4. Use template for new mentee
POST /api/roadmaps/from-template
{ "templateId": "...", "mentorshipId": "..." }
```

---

## Error Handling Tests

### Test Authorization

```bash
# Try to create roadmap as mentee (should fail)
POST /api/roadmaps
# Expected: 403 Forbidden

# Try to access another mentor's roadmap
GET /api/roadmaps/[someone-elses-roadmap]
# Expected: 403 Not authorized
```

### Test Validation

```bash
# Create roadmap with invalid duration
POST /api/roadmaps
{ "duration": 5 }  # Only 4, 8, 12 allowed
# Expected: 400 Duration must be 4, 8, or 12 weeks

# Create milestone without required fields
POST /api/roadmaps/[id]/milestones
{ "description": "Missing title" }
# Expected: 400 Missing required fields
```

---

## Quick Database Checks

After testing, verify data in database:

```sql
-- Check roadmaps created
SELECT id, title, duration, status, "isTemplate"
FROM "Roadmap"
ORDER BY "createdAt" DESC
LIMIT 5;

-- Check milestones
SELECT m.title, m.status, m."dueDate", r.title as roadmap
FROM "Milestone" m
JOIN "Roadmap" r ON m."roadmapId" = r.id
ORDER BY m."createdAt" DESC
LIMIT 10;

-- Check resources
SELECT r.title, r.url, r."resourceType", m.title as milestone
FROM "RoadmapResource" r
JOIN "Milestone" m ON r."milestoneId" = m.id;

-- Check check-ins
SELECT c.status, c."scheduledDate", m.title as milestone
FROM "CheckIn" c
JOIN "Milestone" m ON c."milestoneId" = m.id;
```

---

## Postman Collection

### Import these as a collection:

1. **Environment Variables:**
   ```
   base_url: http://localhost:3000
   mentorship_id: [your-mentorship-id]
   roadmap_id: [created-roadmap-id]
   milestone_id: [created-milestone-id]
   ```

2. **Collection Structure:**
   ```
   Roadmap APIs/
   ├── Roadmaps/
   │   ├── Create Roadmap
   │   ├── List Roadmaps
   │   ├── Get Roadmap
   │   ├── Update Roadmap
   │   └── Archive Roadmap
   ├── Milestones/
   │   ├── Create Milestone
   │   ├── Get Milestone
   │   ├── Update Milestone
   │   └── Delete Milestone
   ├── Check-Ins/
   │   ├── Schedule Check-In
   │   ├── Update Check-In
   │   ├── Complete Check-In
   │   └── Delete Check-In
   ├── Resources/
   │   ├── Add Resource
   │   ├── List Resources
   │   ├── Update Resource
   │   └── Delete Resource
   └── Templates/
       ├── Save as Template
       ├── List Templates
       └── Create from Template
   ```

---

## Expected Status Codes

| Action | Success | Auth Error | Not Found | Validation Error |
|--------|---------|------------|-----------|------------------|
| GET    | 200     | 401        | 404       | 400              |
| POST   | 200     | 401/403    | 404       | 400              |
| PATCH  | 200     | 401/403    | 404       | 400              |
| DELETE | 200     | 401/403    | 404       | -                |

---

## Tips for Testing

1. **Use Postman Collections**: Save time by creating reusable requests
2. **Set Variables**: Use environment variables for IDs
3. **Check Database**: Verify data actually saves correctly
4. **Test Both Roles**: Login as mentor AND mentee to test permissions
5. **Test Edge Cases**: Try invalid data, missing fields, wrong IDs
6. **Monitor Logs**: Check console for error messages

---

## Next Steps After API Testing

Once all APIs work correctly:

1. ✅ Confirm all endpoints return expected data
2. ✅ Verify authorization works (mentors vs mentees)
3. ✅ Check database relationships (cascades work)
4. 🚧 Build frontend components
5. 🚧 Integrate with existing dashboards
6. 🚧 End-to-end testing with UI

---

**Happy Testing! 🚀**
