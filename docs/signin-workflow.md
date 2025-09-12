# Authentication Workflow - E2E Testing Guide

## Overview
This document outlines the complete authentication workflow for E2E testing purposes, written in PRD (Product Requirements Document) format with clear user actions and expected outcomes.

## Email + Passkey + Google Authentication Workflows

### 1. Email Verification Sign Up Flow

#### 1.1 New User Email Sign Up
**User Action:** Navigate to `/auth/signup`
**User Expects:** 
- Sign up page with email input, Google button, and Passkey button
- "Sign up with Email" button
- Link to switch to sign in page

**User Action:** Enter valid email address and click "Sign up with Email"
**User Expects:**
- Success message: "Please check your email for a verification link to complete your account setup."
- Email input cleared
- Redirect to verify-request page OR success message displayed

**User Action:** Check email inbox
**User Expects:**
- Verification email received with subject "Sign in to [domain]"
- Email contains verification link/button

**User Action:** Click verification link in email
**User Expects:**
- Redirect to `/protected` page if verification successful
- User session created and authenticated
- Email marked as verified in database

#### 1.2 Existing Verified User Email Sign Up
**User Action:** Try to sign up with already verified email
**User Expects:**
- Error message: "An account with this email already exists. Please sign in instead."
- Suggested redirect to sign in page

#### 1.3 Existing Unverified User Email Sign Up
**User Action:** Try to sign up with unverified email that already exists
**User Expects:**
- New verification email sent
- Success message displayed
- No duplicate user created

### 2. Email Verification Sign In Flow

#### 2.1 Verified User Email Sign In
**User Action:** Navigate to `/auth/signin`
**User Expects:**
- Sign in page with email input, Google button, and Passkey button
- "Sign in with Email" button
- Link to switch to sign up page

**User Action:** Enter verified email and click "Sign in with Email"
**User Expects:**
- Success message: "Please check your email for a sign in link."
- Redirect to verify-request page OR success message displayed

**User Action:** Click sign in link in email
**User Expects:**
- Redirect to `/protected` page
- User session created and authenticated

#### 2.2 Unverified User Sign In Attempt
**User Action:** Unverified user tries to access `/protected` directly or after email click
**User Expects:**
- Redirect to `/auth/signin?error=EmailNotVerified`
- Error message: "Please verify your email address before signing in. Check your inbox for a verification link."

### 3. Google OAuth Flow

#### 3.1 New User Google Sign Up
**User Action:** Click "Sign up with Google" on signup page
**User Expects:**
- Redirect to Google OAuth consent screen
- Google login and permission grant process

**User Action:** Complete Google authentication
**User Expects:**
- Redirect to `/protected` page
- User account created with Google profile info
- Email automatically marked as verified (via Google)
- User session created

#### 3.2 Existing User Google Sign In
**User Action:** Click "Continue with Google" on signin page
**User Expects:**
- Redirect to Google OAuth (or automatic if already logged in)
- Redirect to `/protected` page after successful auth

### 4. Passkey Authentication Flow

#### 4.1 New User Passkey Registration (First Time)
**User Action:** Click "Sign up with Passkey" on signup page
**User Expects:**
- Browser WebAuthn prompt for passkey creation
- Biometric/PIN authentication prompt

**User Action:** Complete passkey registration
**User Expects:**
- Redirect to `/protected` page
- User account created
- Email marked as verified (passkey implies verification)
- User session created

#### 4.2 Existing User Passkey Sign In
**User Action:** Click "Sign in with Passkey" on signin page
**User Expects:**
- Browser WebAuthn prompt for passkey authentication
- Biometric/PIN authentication prompt

**User Action:** Complete passkey authentication
**User Expects:**
- Redirect to `/protected` page
- User session created

#### 4.3 Add Additional Passkey (Authenticated User)
**User Action:** While authenticated, click "Register new Passkey" in dashboard
**User Expects:**
- Browser WebAuthn prompt for new passkey creation
- Success message after registration
- Additional passkey associated with account

### 5. Protected Routes Access Control

#### 5.1 Unauthenticated Access Attempt
**User Action:** Navigate to `/protected` without authentication
**User Expects:**
- Redirect to `/auth/signin`
- No access to protected content

#### 5.2 Unverified User Access Attempt
**User Action:** Unverified user tries to access `/protected`
**User Expects:**
- Redirect to `/auth/signin?error=EmailNotVerified`
- Clear error message about email verification requirement

#### 5.3 Authenticated Verified User Access
**User Action:** Verified, authenticated user navigates to `/protected`
**User Expects:**
- Access granted to protected dashboard
- User info displayed (name, email, role, verification status)
- Sign out button available
- Option to register additional passkeys

### 6. Session Management

#### 6.1 Sign Out Flow
**User Action:** Click "Sign Out" in protected area
**User Expects:**
- Session terminated
- Redirect to home page (`/`)
- No longer able to access protected routes

#### 6.2 Session Expiry
**User Action:** Wait for session to expire naturally
**User Expects:**
- Automatic redirect to sign in page when accessing protected routes
- Clear indication that session has expired

### 7. Error Handling

#### 7.1 Invalid Verification Link
**User Action:** Click expired or malformed verification link
**User Expects:**
- Redirect to `/auth/signin?error=Verification`
- Error message: "The verification link is invalid or has expired. Please request a new one."

#### 7.2 Network/Server Errors
**User Action:** Authentication request fails due to server issues
**User Expects:**
- Clear error message displayed
- Option to retry the action
- No partial authentication state

#### 7.3 WebAuthn/Passkey Errors
**User Action:** Passkey authentication fails (cancelled, not supported, etc.)
**User Expects:**
- Clear error message
- Fallback options (email, Google)
- No broken state

### 8. Edge Cases

#### 8.1 Multiple Tab Authentication
**User Action:** User authenticates in one tab while having another tab open
**User Expects:**
- Authentication state synced across tabs
- Consistent access to protected routes

#### 8.2 Browser Back/Forward Navigation
**User Action:** Use browser navigation during auth flows
**User Expects:**
- Graceful handling of navigation
- No broken states or infinite redirects

#### 8.3 Form Validation
**User Action:** Submit forms with invalid data (empty email, invalid format)
**User Expects:**
- Client-side validation errors
- Form submission blocked until valid
- Clear error messages

## Environment Variables Required for Testing

```env
# Auth.js
AUTH_SECRET=your-auth-secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# Resend Email
RESEND_API_KEY=your-resend-api-key
AUTH_RESEND_FROM=your-from-email

# Database
DATABASE_URL=your-database-connection-string
```

## Test Data Recommendations

### User Test Accounts
1. **Verified User**: `verified-user@example.com` - Has completed email verification
2. **Unverified User**: `unverified-user@example.com` - Signed up but never verified
3. **Google User**: User with Google account for OAuth testing
4. **Passkey User**: User with registered passkeys

### Test Scenarios Priority
1. **P0 (Critical)**: Email verification flow, Protected route access control
2. **P1 (High)**: Google OAuth, Passkey authentication, Sign out
3. **P2 (Medium)**: Error handling, Edge cases, Multi-passkey registration

## Success Criteria
- ✅ Users can sign up and verify email successfully
- ✅ Unverified users are blocked from protected routes
- ✅ All authentication methods work (Email, Google, Passkey)
- ✅ Session management works correctly
- ✅ Error states are handled gracefully
- ✅ Security requirements are met (email verification required)