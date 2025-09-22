# Google OAuth Setup Guide

## Prerequisites
You need a Google account to create the OAuth credentials.

## Step-by-Step Setup

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create or Select a Project
- If you don't have a project, click "Create Project"
- Give it a name like "URL Shortener OAuth"
- Click "Create"

### 3. Enable Required APIs
- Go to "APIs & Services" > "Library"
- Search for "Google+ API" and enable it
- Also enable "People API" (recommended)

### 4. Create OAuth 2.0 Credentials
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "OAuth 2.0 Client ID"
- Choose application type: "Web application"
- Give it a name: "URL Shortener Web Client"

### 5. Configure Authorized Redirect URIs
Add these URIs to the "Authorized redirect URIs" section:
```
http://localhost:4000/auth/google/callback
```

For production, you'll also add your production domain:
```
https://yourdomain.com/auth/google/callback
```

### 6. Get Your Credentials
After creating, you'll see:
- **Client ID**: A long string ending in `.apps.googleusercontent.com`
- **Client Secret**: A shorter alphanumeric string

### 7. Update Your Environment Variables
Replace the placeholder values in `/backend/.env`:

```bash
GOOGLE_CLIENT_ID="your_actual_client_id_here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_actual_client_secret_here"
```

### 8. Restart the Application
```bash
sudo docker compose restart backend
```

## Testing the OAuth Flow

1. **Visit the login page**: http://localhost:3000/login
2. **Click "Sign in with Google"**
3. **You'll be redirected to Google's OAuth consent screen**
4. **Grant permissions and you'll be redirected back**

## Expected Behavior

### For New Users (Not Invited)
- OAuth will succeed but user will see: "You need to be invited by an administrator"
- This is expected behavior - only invited users can access the app

### For Invited Users
- Super admin must first invite them via `/users` page
- Then they can successfully sign in with Google

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Check that your redirect URI exactly matches what you configured in Google Cloud Console
- Make sure you're using `http://localhost:4000/auth/google/callback` (not 3000)

### "This app isn't verified"
- This is normal for development
- Click "Advanced" → "Go to URL Shortener (unsafe)" to continue
- For production, you'll need to verify your app with Google

### OAuth Flow Works But Gets Stuck
- Check browser console for errors
- Verify the callback URL handles the token correctly
- Check that the JWT token is being properly decoded

## Production Considerations

1. **Domain Configuration**: Add your production domain to authorized redirect URIs
2. **App Verification**: Submit your app for Google's verification process
3. **HTTPS Required**: Production OAuth requires HTTPS
4. **Environment Variables**: Use secure methods to manage production secrets

## Security Notes

- Never commit real OAuth credentials to version control
- Use environment variables for all sensitive data
- The `.env` file is already in `.gitignore`
- Rotate credentials periodically