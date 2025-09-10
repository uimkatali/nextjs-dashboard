-- Database Verification Queries
-- Run these in your PostgreSQL client to verify changes

-- 1. Check if new indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('sessions', 'signup_logs', 'user_profiles')
AND schemaname = 'public'
ORDER BY tablename, indexname;

-- Expected indexes:
-- idx_sessions_expires_at
-- idx_sessions_token  
-- idx_signup_logs_attempt_time
-- idx_user_profiles_user_id
-- idx_users_email

-- 2. Check email normalization (all emails should be lowercase)
SELECT id, email, 
       CASE 
         WHEN email = lower(email) THEN 'normalized' 
         ELSE 'NOT normalized' 
       END as email_status
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Check sessions table structure
\d sessions;

-- 4. Check recent signup attempts with sanitized data
SELECT 
    email,
    success,
    attempt_time,
    ip_address,
    LEFT(error_message, 50) as error_preview,
    LEFT(user_agent, 50) as user_agent_preview
FROM signup_logs 
ORDER BY attempt_time DESC 
LIMIT 10;

-- 5. Check user profiles (should have unique constraint)
SELECT 
    user_id,
    current_weight,
    goal_weight,
    created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 10;

-- 6. Check for any expired sessions
SELECT 
    COUNT(*) as total_sessions,
    COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_sessions,
    COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as expired_sessions
FROM sessions;
