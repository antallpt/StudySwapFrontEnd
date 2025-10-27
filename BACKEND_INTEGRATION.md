# Backend Integration Guide

This guide explains how to connect your React Native app to your Spring Boot backend.

## 🚀 Setup Instructions

### 1. Start Your Spring Boot Backend

Make sure your Spring Boot application is running on `http://localhost:8080`

```bash
# In your Spring Boot project directory
./mvnw spring-boot:run
# or
mvn spring-boot:run
```

### 2. Configure API Endpoints

The app is configured to connect to your backend at:
- **Base URL**: `http://localhost:8080/api/v1`
- **Login Endpoint**: `POST /api/v1/auth/login`
- **Register Endpoint**: `POST /api/v1/auth/register`

### 3. Update API Configuration (if needed)

If your backend runs on a different port or you're using a physical device, update the configuration in `config/api.ts`:

```typescript
export const API_CONFIG = {
  // For local development
  BASE_URL: 'http://localhost:8080/api/v1',
  
  // For Android emulator (if localhost doesn't work)
  // BASE_URL: 'http://10.0.2.2:8080/api/v1',
  
  // For physical device, use your computer's IP
  // BASE_URL: 'http://192.168.1.100:8080/api/v1',
};
```

## 📱 Testing the Integration

### 1. Test Registration
1. Open the app and go to the Sign Up page
2. Fill in all fields including:
   - First Name
   - Last Name
   - Email
   - University
   - Password
   - Confirm Password
3. Tap "Sign Up"
4. You should see a success message if the registration works

### 2. Test Login
1. Go to the Sign In page
2. Enter the email and password you just registered
3. Tap "Sign In"
4. You should be redirected to the home page

## 🔧 Troubleshooting

### Common Issues

1. **Network Error**: 
   - Make sure your Spring Boot backend is running
   - Check if the URL in `config/api.ts` is correct
   - For physical devices, use your computer's IP address instead of localhost

2. **CORS Issues**:
   - Add CORS configuration to your Spring Boot backend:
   ```java
   @CrossOrigin(origins = "*")
   @RestController
   @RequestMapping("/api/v1/auth")
   public class AuthController {
       // your code
   }
   ```

3. **Android Emulator Issues**:
   - Use `http://10.0.2.2:8080/api/v1` instead of localhost

4. **iOS Simulator Issues**:
   - localhost should work fine
   - Make sure your backend is running on port 8080

### API Endpoints Expected

Your backend should have these endpoints:

**POST /api/v1/auth/login**
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": "true"
}
```

**POST /api/v1/auth/register**
```json
Request:
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "university": "University Name"
}

Response:
{
  "success": "true"
}
```

## 🎯 Next Steps

1. **Add Authentication State Management**: Store user session/tokens
2. **Add Protected Routes**: Redirect unauthenticated users
3. **Add User Profile**: Display user information
4. **Add Logout Functionality**: Clear user session

## 📝 Notes

- The app currently shows success/error messages via alerts
- No authentication state is persisted (users need to login each time)
- The "Quick Access" button bypasses authentication for testing
- All API calls include proper error handling and loading states
