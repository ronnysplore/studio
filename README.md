
# StyleAI Studio

StyleAI Studio is a cutting-edge web application that leverages generative AI to revolutionize how users visualize and manage fashion. It offers a suite of tools for both personal style exploration and professional business catalog creation, providing a seamless and intuitive experience powered by Google's Gemini models.

![StyleAI Studio Landing Page](https://storage.googleapis.com/aifirebase.appspot.com/user-generated/2024-07-29/style-ai-landing.png)

---

## 🎬 Project Showcase

- **[View the Project Presentation](https://1drv.ms/p/c/c54129bf85dd293c/EVvCvk-yyn5FjJ3mpP6wXFUBGL5iQ_wB8T4sif37iS6hvA?e=FKJCXO)**: An in-depth look at the project's vision, architecture, and features.
- **Demo Video**: See the application in action [on the live site](#showcase) or check the `/public/uploads/demovideo/demo.mp4` file in this repository.


---

## ✨ Core Features

### For Personal Users
- **Virtual Try-On:** See yourself in new outfits instantly. Upload a photo of yourself and combine it with images of clothing items to generate a realistic preview of you wearing the selected outfit.
- **Digital Wardrobe:** Upload and manage your personal clothing items and photos. All your assets are securely stored in your personal Google Drive folder, making them easy to access and reuse.
- **Outfit History:** Automatically saves every generated try-on image to your Google Drive, creating a visual history of your style experiments.

### For Business Users
- **AI Catalog Generator:** Create professional-grade product photos for your business. Combine images of your mannequins with your product photos and a style description to generate high-quality, AI-powered catalog images.
- **Business Asset Management:** A dedicated space to upload, manage, and organize your brand's assets, such as mannequin photos and product images, stored securely in your Google Drive.

---

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **Generative AI:** [Google Gemini](https://deepmind.google.com/technologies/gemini/) via [Genkit](https://firebase.google.com/docs/genkit)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) with Google Provider
- **Database:** [Firestore](https://firebase.google.com/docs/firestore) for user data (e.g., generation limits)
- **File Storage:** [Google Drive](https://www.google.com/drive/) for all user-uploaded images and AI-generated outputs.

---

## 🛠️ Getting Started

Follow these instructions to set up and run the project locally.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/mikesplore/studio.git
cd studio
npm install
```

### 3. Environment Setup

Create a `.env` file in the root of your project by copying the example below. You will need to obtain credentials from Google Cloud and Firebase to populate this file.

```env
# Gemini API Key (Google AI Studio)
GEMINI_API_KEY=your-gemini-api-key-here

# NextAuth.js Configuration
AUTH_SECRET=generate-a-strong-secret-here
NEXTAUTH_URL=http://localhost:9002

# Google OAuth Credentials (Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here

# Firebase Configuration (Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### 4. Running the Development Server

Once your `.env` file is configured, you can start the application:

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

---

## 🔑 Environment Variables Explained

You need to configure the following services to run the application:

#### **Google AI (for Gemini API)**
- `GEMINI_API_KEY`:
  - **Purpose:** Grants access to Google's Gemini models for all generative AI features.
  - **How to get it:**
    1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
    2. Click "**Create API key**" and copy the key.

#### **NextAuth.js (for Authentication)**
- `AUTH_SECRET`:
  - **Purpose:** A secret key used to encrypt session data and tokens.
  - **How to get it:** Generate a strong, random string. You can use an online generator or the following command in your terminal: `openssl rand -hex 32`
- `NEXTAUTH_URL`:
  - **Purpose:** The base URL of your application, used by NextAuth for redirects.
  - **Value for local development:** `http://localhost:9002`

#### **Google Cloud Console (for OAuth & Google Drive)**
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`:
  - **Purpose:** Allows users to sign in with their Google account and grants the app permission to access their Google Drive.
  - **How to get them:**
    1. Go to the [Google Cloud Console Credentials page](https://console.cloud.google.com/apis/credentials).
    2. Click "**Create Credentials**" > "**OAuth client ID**".
    3. Select "**Web application**" for the Application type.
    4. Under "**Authorized JavaScript origins**", add `http://localhost:9002`.
    5. Under "**Authorized redirect URIs**", add `http://localhost:9002/api/auth/callback/google`.
    6. Click **Create** and copy the Client ID and Client Secret.

#### **Firebase (for User Database)**
- `NEXT_PUBLIC_FIREBASE_*` variables:
  - **Purpose:** Connects the application to your Firebase project to use Firestore for storing user-specific data.
  - **How to get them:**
    1. Go to the [Firebase Console](https://console.firebase.google.com/).
    2. Create a new project or select an existing one.
    3. Go to **Project Settings** (click the gear icon).
    4. In the **General** tab, scroll down to "**Your apps**".
    5. Click "**Add app**" and select the **Web** platform (`</>`).
    6. Register your app (e.g., "StyleAI Studio Web").
    7. After registration, Firebase will provide you with a `firebaseConfig` object. Copy the values from this object into your `.env` file.
    8. Go to the **Firestore Database** section in the Firebase console and create a new database in **Test mode** to get started quickly.
