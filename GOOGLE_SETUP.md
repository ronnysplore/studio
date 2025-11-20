# Google OAuth & Drive Integration Setup

## Overview
This app now integrates with Google Authentication and Google Drive to:
- Allow users to sign in with their Google account
- Automatically save uploaded photos to Google Drive (StyleAI folder)
- Save generated try-on images to Google Drive
- Browse outfit history from Google Drive
- Access Google Photos for easy photo selection

## Setup Instructions

### 1. Create Google Cloud Project & OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Drive API
   - Google Photos Library API
   
4. Configure OAuth Consent Screen:
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Fill in app name: "StyleAI Studio"
   - Add your email as support email
   - Add scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `../auth/drive.file`
     - `../auth/photoslibrary.readonly`
   
5. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
   - Copy the Client ID and Client Secret

### 2. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your credentials in `.env.local`:
   - `GOOGLE_CLIENT_ID`: Your OAuth Client ID
   - `GOOGLE_CLIENT_SECRET`: Your OAuth Client Secret
   - `AUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `GOOGLE_GENAI_API_KEY`: Your existing Gemini API key

### 3. Google Drive Folder Structure

The app automatically creates this structure in the user's Google Drive:

```
StyleAI/
├── User Photos/          # User-uploaded photos
├── Wardrobe Items/       # Clothing and accessory images
└── Generated Outfits/    # AI-generated try-on results
```

### 4. Features

#### Authentication
- Sign in with Google button in header
- User avatar and profile menu
- Secure session management with NextAuth.js

#### Google Drive Integration
- **Auto-save uploads**: All uploaded photos automatically save to Drive
- **Auto-save results**: Generated try-on images save to Drive
- **Cross-device sync**: Access your wardrobe from any device
- **Persistent storage**: Photos remain available across sessions

#### Outfit History
- View all generated try-on images
- Download or open in Google Drive
- Organized by creation date

#### Planned Features (TODO)
- Google Photos picker integration
- Browse and select photos directly from Google Photos
- Delete files from Drive via UI
- Share generated outfits

## File Structure

```
src/
├── auth.ts                           # NextAuth configuration
├── types/next-auth.d.ts             # TypeScript types for sessions
├── lib/google-drive.ts              # Google Drive service class
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # Auth endpoints
│   │   ├── drive/route.ts               # Drive file operations
│   │   └── save-outfit/route.ts         # Save generated images
│   └── dashboard/
│       └── history/page.tsx         # Outfit history viewer
└── contexts/wardrobe-context.tsx    # Updated with Drive support
```

## Usage Flow

1. **User signs in** with Google
2. **Uploads photos** → Saved to `StyleAI/User Photos/` in Drive
3. **Uploads wardrobe items** → Saved to `StyleAI/Wardrobe Items/`
4. **Generates try-on** → Result saved to `StyleAI/Generated Outfits/`
5. **Views history** → Browses all generated outfits from Drive

## Development

Run the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` and test:
1. Click "Log In" to authenticate with Google
2. Upload photos in Wardrobe Manager
3. Generate a try-on
4. Check your Google Drive for the StyleAI folder
5. Visit `/dashboard/history` to see saved outfits

## Security Notes

- Never commit `.env.local` to version control
- OAuth credentials are sensitive - keep them secure
- Use HTTPS in production
- Refresh tokens are stored securely in session
- Drive access is limited to files created by the app

## Troubleshooting

**"Unauthorized" errors**:
- Verify OAuth credentials in `.env.local`
- Check authorized redirect URIs match exactly
- Ensure APIs are enabled in Google Cloud Console

**Photos not saving**:
- Check browser console for errors
- Verify user has granted Drive permissions
- Check Google Drive quota hasn't been exceeded

**Session expires quickly**:
- Refresh tokens should keep users signed in
- Check `AUTH_SECRET` is set correctly
