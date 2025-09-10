# Manual Database Fixes Verification Guide

## 🧪 How to Physically Test All Changes

### 1. **Check Database Schema Changes**

Connect to your PostgreSQL database and verify the new indexes:

```sql
-- Check if new indexes were created
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('sessions', 'signup_logs', 'user_profiles');

-- Expected results should include:
-- idx_sessions_expires_at
-- idx_signup_logs_attempt_time
-- idx_user_profiles_user_id
```

### 2. **Test Email Normalization Fix**

**Before Fix:** Could create duplicate users with different case emails
**After Fix:** Should reject duplicate emails regardless of case

```bash
# Test 1: Create user with uppercase email
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"TEST@EXAMPLE.COM","password":"password123"}'

# Expected: Success

# Test 2: Try same email in lowercase
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User 2","email":"test@example.com","password":"password123"}'

# Expected: Failure - "Email already registered"
```

### 3. **Test Logout Cookie Fix**

**Before Fix:** Logout cleared wrong cookie, user stayed logged in
**After Fix:** Logout properly clears session and database entry

```bash
# Step 1: Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Step 2: Verify session is valid
curl -X GET http://localhost:3000/api/auth/validate \
  -b cookies.txt

# Expected: {"valid":true,"userId":X}

# Step 3: Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt

# Step 4: Verify session is invalid
curl -X GET http://localhost:3000/api/auth/validate \
  -b cookies.txt

# Expected: {"valid":false}
```

### 4. **Test Session Cleanup**

**Before Fix:** No cleanup mechanism
**After Fix:** Expired sessions are automatically cleaned

```bash
# Check current session stats
curl -X GET http://localhost:3000/api/auth/cleanup

# Run cleanup
curl -X POST http://localhost:3000/api/auth/cleanup

# Check stats again to see cleaned sessions
curl -X GET http://localhost:3000/api/auth/cleanup
```

### 5. **Test Input Validation**

**Before Fix:** Weak validation
**After Fix:** Strong password and email validation

```bash
# Test weak password (should fail)
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test2@example.com","password":"123"}'

# Expected: "Password must be at least 8 characters long"

# Test invalid email (should fail)
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"invalid-email","password":"password123"}'

# Expected: "Please enter a valid email address"
```

### 6. **Test Database Health Monitoring**

**New Feature:** Health check endpoint

```bash
# Check database health
curl -X GET http://localhost:3000/api/health

# Expected response:
# {
#   "status": "healthy",
#   "database": true,
#   "poolStats": {
#     "totalCount": X,
#     "idleCount": Y,
#     "waitingCount": Z
#   },
#   "timestamp": "2024-..."
# }
```

### 7. **Test Profile Creation Race Condition Fix**

**Before Fix:** Multiple profile creation attempts could cause errors
**After Fix:** Safe concurrent profile creation

This requires concurrent testing - you can simulate by:

1. Opening multiple browser tabs
2. Login with same user simultaneously
3. Navigate to home page in all tabs
4. Should not see any profile creation errors

### 8. **Verify Transaction Safety**

**Before Fix:** User creation could be partially completed
**After Fix:** Atomic user creation with rollback on failure

To test this, you would need to:

1. Monitor database during signup
2. Simulate database failures
3. Verify no partial user records are created

### 9. **Check Connection Pool Monitoring**

**New Feature:** Pool statistics and monitoring

```bash
# Check pool stats in health endpoint
curl -X GET http://localhost:3000/api/health

# Look for poolStats in response:
# "poolStats": {
#   "totalCount": 1,    # Total connections
#   "idleCount": 1,     # Available connections
#   "waitingCount": 0   # Queued requests
# }
```

### 10. **Verify Error Logging Improvements**

**New Feature:** Structured error logging

Check your application logs for:

- Database query errors with redacted parameters
- Slow query warnings (>1000ms)
- Connection pool events
- Sanitized signup attempt logs

## 🔍 Browser Testing

### Test in Browser:

1. **Email Normalization:**

   - Sign up with `Test@Example.com`
   - Try to sign up with `test@example.com` → Should be rejected

2. **Complete Auth Flow:**

   - Sign up → Login → Navigate to home → Logout → Try to access home
   - Should be redirected to login after logout

3. **Input Validation:**
   - Try weak passwords
   - Try invalid email formats
   - Should see appropriate error messages

## 📊 Database Verification Queries

Connect to your PostgreSQL database and run:

```sql
-- 1. Check email normalization in existing users
SELECT id, email, lower(email) as normalized_email
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check sessions table structure
\d sessions;
-- Should include expires_at column and indexes

-- 3. Check signup logs
SELECT email, success, attempt_time, ip_address
FROM signup_logs
ORDER BY attempt_time DESC
LIMIT 10;

-- 4. Check user profiles
SELECT user_id, current_weight, goal_weight
FROM user_profiles
ORDER BY created_at DESC
LIMIT 10;

-- 5. Verify indexes exist
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## 🚨 What to Look For

### ✅ Success Indicators:

- Health check returns "healthy"
- Email case doesn't matter for duplicates
- Logout actually logs user out
- Weak passwords are rejected
- Invalid emails are rejected
- No profile creation errors
- Session cleanup removes expired sessions

### ❌ Failure Indicators:

- Health check returns "unhealthy"
- Can create duplicate emails with different cases
- Still logged in after logout
- Weak passwords accepted
- Database errors in logs
- Profile creation constraint violations

## 🎯 Performance Testing

Test under load to verify connection pooling:

```bash
# Install Apache Bench (ab) or similar tool
# Run concurrent requests
ab -n 100 -c 10 http://localhost:3000/api/health

# Monitor connection pool stats during load
while true; do
  curl -s http://localhost:3000/api/health | grep -o '"poolStats":[^}]*}'
  sleep 1
done
```

This guide should help you verify every aspect of the database fixes we implemented!
