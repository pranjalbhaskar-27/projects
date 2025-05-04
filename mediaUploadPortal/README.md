# BSSA Media Upload/Download Portal

A centralized platform for photographers and videographers to upload media content to Google Drive, and for users to browse and download this content.

## Features

- Google Authentication for secure access
- Password-protected media upload
- Gallery view of uploaded media
- Media preview and download functionality
- Direct integration with Google Drive

## Prerequisites

- Node.js (v14.x or later)
- Google Cloud Platform account
- Google Drive API enabled
- OAuth2 credentials

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd mediaUploadPortal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Google Cloud Platform

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Drive API
4. Set up OAuth 2.0 credentials:
   - Create OAuth client ID
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
5. Note your Client ID and Client Secret

### 4. Create a shared Google Drive folder

1. Create a folder in Google Drive where media will be uploaded
2. Note the folder ID (from the URL: `https://drive.google.com/drive/folders/FOLDER_ID`)
3. Configure appropriate sharing permissions for the folder

### 5. Set up environment variables

Create a `.env.local` file in the root directory:

```
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Google Drive
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id

# Portal config
UPLOAD_PASSWORD=your-upload-password
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Build for production

```bash
npm run build
npm start
```

## Deployment

This application can be deployed to Vercel, Netlify, or any hosting platform that supports Next.js applications.

Make sure to configure environment variables in your hosting platform's dashboard.

## License

This project is licensed under the MIT License. 