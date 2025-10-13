# MenteeMatch Testing Guide

This guide covers all aspects of testing the MenteeMatch application, including running tests, using seed data, and manual testing.

## Table of Contents

1. [Security Fixes](#security-fixes)
2. [Database Seeding](#database-seeding)
3. [Running Automated Tests](#running-automated-tests)
4. [Manual Testing](#manual-testing)
5. [Test Coverage](#test-coverage)

---

## Security Fixes

### Implemented Security Improvements

✅ **Bcrypt Password Hashing**
- Passwords are now securely hashed using bcrypt during signup
- Login uses `bcrypt.compare()` for secure password verification
- Production uses 10 salt rounds, development uses 4 for faster testing

✅ **No Hardcoded IDs**
- All user IDs are dynamically fetched from the database
- No test IDs remain in production code

✅ **Proper Database Connection Management**
- Prisma client singleton pattern prevents connection leaks
- Connections are properly managed across development and production

---

## Database Seeding

### Test Accounts

All test accounts use the password: **`Test123!`**

#### Mentors

1. **Sarah Johnson** - `sarah.mentor@test.com`
   - Senior Full-Stack Developer (React, Node.js, TypeScript)
   - Rating: 4.8/5
   - Available: Monday, Wednesday, Friday (Evenings)

2. **David Chen** - `david.mentor@test.com`
   - Lead Data Scientist (Python, ML, AI)
   - Rating: 4.9/5
   - Available: Tuesday, Thursday, Saturday (Mornings/Afternoons)

3. **Emily Rodriguez** - `emily.mentor@test.com`
   - Senior UX Designer (UX, UI, Figma)
   - Rating: 4.7/5
   - Available: Monday, Tuesday, Thursday (Afternoons/Evenings)

#### Mentees

1. **Alex Thompson** - `alex.mentee@test.com`
   - CS Student learning web development
   - Skills: JavaScript, Python, SQL
   - Goals: Learn coding, Build projects, Interview prep

2. **Maria Garcia** - `maria.mentee@test.com`
   - Career changer (Marketing → Data Science)
   - Skills: Python, SQL, Statistics
   - Goals: Transition career, Learn coding, Career guidance

3. **James Wilson** - `james.mentee@test.com`
   - Bootcamp graduate
   - Skills: React, Node.js, JavaScript
   - Goals: Interview prep, Resume review, Build projects

### Running the Seed Script

```bash
# Seed the database with test data
npm run seed

# Or manually with ts-node
npx ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts
```

The seed script will:
1. Clear existing data (messages, conversations, tasks, mentorships, etc.)
2. Create 3 mentors and 3 mentees with complete profiles
3. Create mentorship relationships
4. Add sample sessions, tasks, messages, and conversations
5. Add ratings and feedback

---

## Running Automated Tests

### All Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Specific Test Suites

```bash
# Run only auth tests
npm test -- auth

# Run only matching tests
npm test -- matching

# Run only messaging tests
npm test -- messages

# Run a specific test file
npm test -- signup.test.ts
```

### Test Structure

```
__tests__/
├── api/
│   ├── auth/
│   │   ├── signup.test.ts       # Signup validation & user creation
│   │   └── login.test.ts        # Authentication & session management
│   ├── mentorship/
│   │   └── matching.test.ts     # Mentor matching algorithm
│   └── messages/
│       └── send.test.ts         # Message sending & authorization
└── utils/
    └── test-helpers.ts          # Shared test utilities
```

### What's Tested

#### Authentication (120+ test cases)
- ✅ Signup validation (email, password strength, role)
- ✅ Password hashing with bcrypt
- ✅ Duplicate user detection
- ✅ Login authentication with bcrypt.compare()
- ✅ JWT token generation and session management
- ✅ Security: No plain text password storage

#### Mentorship Matching (30+ test cases)
- ✅ Input validation (mentee ID, skills, etc.)
- ✅ Matching algorithm with TF-IDF + Word Embeddings
- ✅ Mentor ranking and scoring
- ✅ Handling incomplete profiles
- ✅ Error handling for algorithm failures

#### Messaging (40+ test cases)
- ✅ Authentication required
- ✅ Authorization (can only message in your conversations)
- ✅ Content validation and trimming
- ✅ Receiver determination (mentor ↔ mentee)
- ✅ Conversation timestamp updates
- ✅ Database error handling

---

## Manual Testing

### 1. Test User Authentication

#### Signup Flow
```bash
# Start the dev server
npm run dev

# Navigate to http://localhost:3000/signup
```

Test cases:
- Try weak passwords (should fail)
- Try invalid email formats (should fail)
- Create a new user with valid data
- Try creating duplicate user (should fail)

#### Login Flow
```bash
# Navigate to http://localhost:3000/login
```

Test with seed data accounts:
- Login as `sarah.mentor@test.com` / `Test123!`
- Login as `alex.mentee@test.com` / `Test123!`
- Try wrong password (should fail)
- Try non-existent user (should fail)

### 2. Test Mentorship Matching

Login as a mentee account and:
1. Complete your profile with skills and goals
2. Navigate to "Find Mentors" page
3. Verify matches are ranked by relevance
4. Check that mentor details are displayed correctly

### 3. Test Messaging

Using seed data accounts:
1. Login as `alex.mentee@test.com`
2. Navigate to messages
3. Open conversation with Sarah Johnson
4. Send a message
5. Login as `sarah.mentor@test.com`
6. Verify the message appears
7. Reply to the message
8. Verify real-time updates

### 4. Test Session Booking

1. Login as mentee
2. Find a mentor
3. View their availability
4. Book a session
5. Login as mentor
6. Verify session appears in dashboard
7. Confirm or modify the session

### 5. Test Task Management

1. Login as `sarah.mentor@test.com`
2. Navigate to mentee Alex Thompson
3. Create a new task
4. Login as `alex.mentee@test.com`
5. Verify task appears
6. Mark task as in progress
7. Complete the task
8. Verify status updates

---

## Test Coverage

Current coverage targets (configured in jest.config.js):
- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

### View Coverage Report

```bash
npm run test:coverage
```

This generates a coverage report in `coverage/` directory. Open `coverage/lcov-report/index.html` in a browser to view detailed coverage.

### Areas with High Coverage
- ✅ Authentication (signup, login)
- ✅ Password security (bcrypt)
- ✅ Input validation
- ✅ Authorization checks

### Areas to Improve
- 🔄 Integration tests for full user flows
- 🔄 API endpoint error scenarios
- 🔄 Database transaction rollbacks
- 🔄 File upload functionality

---

## Tips for Testing

### Best Practices

1. **Always seed the database before manual testing**
   ```bash
   npm run seed
   ```

2. **Use test accounts for consistent results**
   - Don't modify test account profiles during testing
   - Re-seed if data becomes inconsistent

3. **Check console logs for debugging**
   - Auth flow logs show authentication steps
   - Matching algorithm logs show scoring details
   - Message logs show delivery status

4. **Test error scenarios**
   - Try invalid inputs
   - Test without authentication
   - Test with missing data
   - Verify error messages are user-friendly

5. **Run tests before committing**
   ```bash
   npm test
   ```

### Common Issues

**Tests failing due to TypeScript errors**
```bash
# Regenerate Prisma client
npx prisma generate
```

**Database connection issues**
```bash
# Check your .env file has DATABASE_URL set
# Restart the Prisma connection
npx prisma db push
```

**Seed script fails**
```bash
# Clear the database first
npx prisma migrate reset
# Then re-run seed
npm run seed
```

---

## Next Steps

### Recommended Additional Tests

1. **E2E Tests with Playwright**
   - Test complete user journeys
   - Cross-browser testing
   - Mobile responsiveness

2. **Load Testing**
   - Test with multiple concurrent users
   - Verify database query performance
   - Test matching algorithm with large datasets

3. **Security Testing**
   - SQL injection attempts
   - XSS prevention
   - CSRF protection
   - Rate limiting

4. **Integration Tests**
   - Test API endpoints with real database
   - Test external service integrations
   - Test file upload/download

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [Supertest Documentation](https://github.com/ladjs/supertest)

---

## Support

If you encounter issues:
1. Check this guide first
2. Review test logs for error messages
3. Check Prisma Studio for database state
4. Re-seed the database if needed

Happy Testing! 🎉
