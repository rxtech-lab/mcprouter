# E2E Testing Setup

This directory contains End-to-End tests for the authentication system using Playwright.

## Setup

1. **Environment Variables**: Make sure you have a `TEST_DATABASE_URL` in your `.env.local` file pointing to a separate test database.

2. **Test Database**: Create a separate PostgreSQL database for testing to avoid affecting your development data.

3. **Install Dependencies**: All dependencies should already be installed via the main `package.json`.

## Running Tests

```bash
# Run all E2E tests
bun run test:e2e

# Run tests with visible browser (helpful for debugging)
bun run test:e2e:headed

# Run tests in debug mode (step through tests)
bun run test:e2e:debug
```

## Test Structure

### Authentication Flow Tests (`auth.spec.ts`)

Tests cover the complete authentication workflow:

1. **Navigation**: Users can access sign-in and sign-up pages
2. **Sign-up Prevention**: Users who haven't signed up cannot sign in
3. **Passkey Registration**: Users can sign up with passkey and see verification message
4. **Duplicate Prevention**: Users cannot sign up twice with the same email
5. **Email Verification**: Users cannot sign in until verified, then can sign in after verification

### Test Utilities (`utils/`)

- **`database.ts`**: Database helpers for clearing data, verifying users, etc.
- **`global-setup.ts`**: Runs before all tests to prepare test environment
- **`global-teardown.ts`**: Runs after all tests to clean up

## WebAuthn Virtual Authenticator

Tests use Playwright's WebAuthn Virtual Authenticator via Chrome DevTools Protocol (CDP) for realistic passkey testing:

- **Virtual Authenticator**: Creates a CTAP2-compliant virtual authenticator with resident key support
- **Credential Management**: Can add/remove credentials programmatically for testing
- **User Verification**: Simulates user verification (biometric/PIN) flows
- **Realistic Behavior**: Uses actual WebAuthn protocol implementation rather than mocks

The virtual authenticator is configured with:
- Protocol: CTAP2 (Client to Authenticator Protocol 2)
- Transport: Internal (platform authenticator)
- Resident keys: Enabled
- User verification: Available and verified

## Test Data

Tests use dynamically generated test emails to avoid conflicts:
- Format: `test-{timestamp}-{random}@example.com`
- Each test gets a unique email address
- Database is cleared between tests for isolation

## Key Test IDs

The following `data-testid` attributes are used in tests:

- `auth-page`: Main auth page container
- `auth-card`: Auth card component
- `auth-title`: Page title
- `auth-description`: Page description
- `auth-form`: Auth form container
- `email-input`: Email input field
- `email-input-error`: Email validation error
- `passkey-signup-button`: Passkey signup button
- `passkey-signin-button`: Passkey signin button
- `google-signup-button`: Google signup button
- `google-signin-button`: Google signin button
- `signup-link`: Link to signup page
- `signin-link`: Link to signin page
- `email-not-verified-error`: Email verification error message

## Environment Variables

Required for testing:
- `TEST_DATABASE_URL`: PostgreSQL connection string for test database
- `NODE_ENV=test`: Automatically set by the test runner

## Notes

- Tests run against a separate test database to avoid affecting development data
- Email sending is automatically disabled in test mode
- WebAuthn is mocked for consistent testing
- Each test is isolated with database cleanup
- Tests use Chromium by default (can be configured in `playwright.config.ts`)