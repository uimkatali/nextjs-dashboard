# Login Functionality Test Guide

## Prerequisites

1. Run database migrations: `curl http://localhost:3000/api/dev/migrate`
2. Start the development server: `pnpm dev`

## Test Steps

### 1. Test Signup First

1. Go to `http://localhost:3000/signup`
2. Fill out the form with:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
3. Submit the form
4. Should redirect to `/login`

### 2. Test Login

1. Go to `http://localhost:3000/login`
2. Enter credentials:
   - Email: "test@example.com"
   - Password: "password123"
3. Click "LET'S GO!" button
4. Should redirect to `/home` dashboard

### 3. Test Validation

1. Try logging in with:
   - Empty fields → Should show validation errors
   - Invalid email format → Should show email validation error
   - Wrong password → Should show "Invalid email or password"
   - Non-existent email → Should show "Invalid email or password"

### 4. Test Protected Route

1. Try accessing `http://localhost:3000/home` without logging in
2. Should redirect to `/login`

### 5. Test Session Persistence

1. After successful login, refresh the page
2. Should stay on `/home` (session should persist)

## API Testing (Optional)

### Test Login API directly:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test with wrong credentials:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpassword"}'
```

## Expected Results

- ✅ Signup creates user in database
- ✅ Login validates credentials against database
- ✅ Successful login creates session and sets cookie
- ✅ Redirects to `/home` dashboard
- ✅ Protected routes require authentication
- ✅ Form validation works properly
- ✅ Error messages are user-friendly
