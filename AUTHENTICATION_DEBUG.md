# Authentication Flow Debug Information

## Current Issue
The refresh token is being invalidated immediately after registration/login, causing authentication to fail when trying to fetch data.

## Timeline of Events (from logs)
1. ✅ User registers successfully - gets access token + refresh token
2. ✅ Product creation works (201)
3. ✅ User profile fetch works (200)
4. ❌ Products fetch fails with 403
5. ❌ Token refresh fails with 401 "Invalid or expired refresh token"
6. ❌ Tokens are cleared, user loses authentication

## Backend Token Rotation Logic
- Backend uses **refresh token rotation** for security
- When a refresh token is used, it's marked as "rotated" and a new one is issued
- The old token becomes invalid immediately
- Query: `findByRefreshTokenHashAndRevokedAtIsNullAndRotatedAtIsNullAndExpiresAtAfter`
- This means once `rotatedAt` is set, the token can never be used again

## Hypothesis
The refresh token might be getting rotated somewhere between registration and the products fetch, causing it to become invalid. Possible causes:
1. **Race condition**: Multiple API calls happening simultaneously
2. **Unexpected token refresh**: Something triggering a token refresh we don't know about
3. **Backend issue**: Token being marked as rotated incorrectly
4. **Device ID mismatch**: The device ID might not match between requests

## Next Steps
1. Run the app with the new debugging to see:
   - JWT token expiration time
   - Whether the token is actually expired
   - Which endpoint is failing
   - Token subject (user ID)

2. Check backend logs to see:
   - If refresh token is being used somewhere
   - If there's a device ID mismatch
   - If token is being marked as rotated unexpectedly

3. Consider temporary workaround:
   - Disable token rotation temporarily to test
   - Or implement a grace period for token rotation

## Questions to Investigate
1. Why is the products endpoint returning 403 when other endpoints work?
2. Is the JWT token actually expired or is it a validation issue?
3. Is there a race condition where multiple requests trigger simultaneous refresh attempts?
4. Is the device ID consistent across all requests?

