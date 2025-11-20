# Fix: Access Blocked - Google Verification

## The Issue
Your OAuth app is in "Testing" mode and requires adding test users.

## Quick Fix (5 minutes)

### Step 1: Go to OAuth Consent Screen
1. Visit: https://console.cloud.google.com/apis/credentials/consent
2. Make sure you're on the correct project

### Step 2: Add Test Users
1. Scroll down to **"Test users"** section
2. Click **"+ ADD USERS"**
3. Add your email: `mo664040@gmail.com`
4. Click **"SAVE"**

### Step 3: Verify Settings
Make sure:
- **Publishing status**: Testing ✓
- **User type**: External ✓
- **Test users**: mo664040@gmail.com ✓

### Step 4: Try Again
1. Go back to http://localhost:9002
2. Click "Sign in with Google"
3. Should work now! ✅

## Alternative: Publish the App (takes longer)

If you want anyone to be able to sign in:

1. Click **"PUBLISH APP"** button
2. Complete the verification questionnaire
3. Wait for Google's approval (can take days/weeks)

**For development, just add yourself as a test user - it's instant!**

## Troubleshooting

**Still seeing error?**
- Wait 1-2 minutes after adding test user
- Clear browser cookies for localhost:9002
- Try in incognito mode

**Can't find consent screen?**
- Make sure you're logged into Google Cloud Console with the same account
- Check you're in the right project
