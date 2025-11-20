# Quick Google OAuth Setup

## IMMEDIATE STEPS TO FIX "Access Blocked" Error

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/apis/credentials

### 2. Create OAuth 2.0 Client ID

**If you don't have a project:**
1. Click "Create Project"
2. Name it "StyleAI" or similar
3. Click "Create"

**Create OAuth Client:**
1. Click "+ CREATE CREDENTIALS" button
2. Select "OAuth client ID"
3. If asked to configure consent screen first:
   - Click "CONFIGURE CONSENT SCREEN"
   - Choose "External"
   - Fill in:
     - App name: `StyleAI Studio`
     - User support email: `mo664040@gmail.com`
     - Developer contact: `mo664040@gmail.com`
   - Click "SAVE AND CONTINUE"
   - Skip Scopes for now (click "SAVE AND CONTINUE")
   - Add test users: `mo664040@gmail.com`
   - Click "SAVE AND CONTINUE"
   - Click "BACK TO DASHBOARD"

4. Go back to "Credentials"
5. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
6. Application type: **Web application**
7. Name: `StyleAI Web Client`
8. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   ```
9. **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```
10. Click "CREATE"
11. **COPY THE CLIENT ID AND CLIENT SECRET**

### 3. Update Your .env File

Open `/home/mike/Development/Build_with_AI/studio/.env` and replace:

```bash
GOOGLE_CLIENT_ID=your-actual-client-id-from-step-2.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret-from-step-2
```

### 4. Generate AUTH_SECRET

Run this command in terminal:
```bash
openssl rand -base64 32
```

Copy the output and add to `.env`:
```bash
AUTH_SECRET=paste-the-output-here
```

### 5. Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### 6. Test Sign In

1. Go to http://localhost:3000
2. Click "Sign in with Google"
3. Should work now! ✅

## After Basic Auth Works

Once you can sign in successfully, you can add Drive/Photos scopes:

1. Go back to Google Cloud Console
2. Edit your OAuth consent screen
3. Add scopes:
   - `../auth/drive.file`
   - `../auth/photoslibrary.readonly`
4. Update `src/auth.ts` to include Drive scopes (commented out for now)

## Troubleshooting

**"Access blocked" error:**
- Make sure redirect URI matches EXACTLY: `http://localhost:3000/api/auth/callback/google`
- Check CLIENT_ID and CLIENT_SECRET are correct
- Verify you're using the test user email in consent screen

**"redirect_uri_mismatch" error:**
- The URI in Google Console must match exactly (no trailing slash, correct port)
- Wait 5 minutes after changing URIs for changes to propagate

**"unauthorized_client" error:**
- Check CLIENT_ID is correct
- Verify the OAuth client type is "Web application"
