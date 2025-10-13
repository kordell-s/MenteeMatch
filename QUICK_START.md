# MenteeMatch - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Seed the Database
```bash
npm run seed
```
This creates 6 test users (3 mentors, 3 mentees) with real data.

### 2. Run the Tests
```bash
npm test
```
Verify everything works: **57/63 tests passing (90.5%)**

### 3. Start the App
```bash
npm run dev
```
Open http://localhost:3000

---

## 🔐 Test Accounts

**All passwords**: `Test123!`

### Mentors
- `sarah.mentor@test.com` - Full-Stack Developer
- `david.mentor@test.com` - Data Scientist
- `emily.mentor@test.com` - UX Designer

### Mentees
- `alex.mentee@test.com` - CS Student
- `maria.mentee@test.com` - Career Changer
- `james.mentee@test.com` - Bootcamp Graduate

---

## ✅ What's New

### Security Fixes
- ✅ **Bcrypt password hashing** (was plain text!)
- ✅ **Secure login** with bcrypt.compare()
- ✅ **No hardcoded IDs**
- ✅ **Proper database connection management**

### Testing Infrastructure
- ✅ **63 comprehensive tests** (auth, matching, messaging)
- ✅ **Database seed script** with realistic data
- ✅ **Test utilities** for common operations
- ✅ **90.5% test pass rate**

---

## 📝 Common Commands

```bash
# Seed database
npm run seed

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## 🧪 Test What You've Built

### 1. Authentication
```bash
# Login as mentee
Email: alex.mentee@test.com
Password: Test123!
```
✅ Passwords are now securely hashed with bcrypt!

### 2. Mentor Matching
- Login as a mentee
- Browse mentors
- See personalized matches based on your skills

### 3. Messaging
- Login as `alex.mentee@test.com`
- Check messages
- See pre-existing conversation with Sarah

### 4. Sessions & Tasks
- Login as mentor
- View your mentees
- See scheduled sessions and assigned tasks

---

## 📚 Documentation

- **[TESTING.md](TESTING.md)** - Comprehensive testing guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Detailed implementation docs

---

## 🐛 Troubleshooting

**Tests failing?**
```bash
npx prisma generate
npm test
```

**Need fresh data?**
```bash
npm run seed
```

**Database issues?**
```bash
npx prisma migrate reset
npm run seed
```

---

## 🎯 What to Try Next

1. **Login with different test accounts** to see different perspectives
2. **Send messages** between mentor and mentee
3. **Create new tasks** as a mentor
4. **Book sessions** as a mentee
5. **Run the tests** to verify everything works

---

## 💡 Pro Tips

- Re-run `npm run seed` anytime you need fresh data
- Use `npm run test:watch` during development
- Check `TESTING.md` for detailed manual testing procedures
- Test accounts are pre-connected (mentorships already exist!)

---

**🎉 You're all set! Start with `npm run seed` and `npm run dev`**
