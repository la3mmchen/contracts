# GitHub Pages Demo Setup

This document explains how to set up and deploy your contracts application to GitHub Pages for a live demo.

## Prerequisites

- Your repository is hosted on GitHub
- You have admin access to the repository
- The repository is public (or you have GitHub Pro for private repos with Pages)

## Setup Steps

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. Click **Save**

### 2. Configure Repository Settings

The GitHub Actions workflow will automatically:
- Build your React application
- Deploy it to GitHub Pages
- Make it available at `https://la3mmchen.github.io/contracts`

### 3. Manual Deployment (Optional)

If you want to deploy manually:

```bash
cd client
npm install
npm run deploy
```

## How It Works

### Build Process

1. **Development Mode**: Uses `/` as base path (normal local development)
2. **Production Mode**: Uses `/contracts/` as base path (GitHub Pages deployment)

### Automatic Deployment

- Every push to the `main` branch triggers a new build and deployment
- Pull requests trigger builds for testing (but don't deploy)
- The workflow uses Node.js 20 and caches dependencies for faster builds

### Demo Mode

**When deployed to GitHub Pages, your app automatically runs in Demo Mode:**

- ✅ **No API Required**: The app works without a backend server
- ✅ **Sample Data**: Pre-loaded with realistic contract examples
- ✅ **Full Functionality**: All features work with demo data
- ✅ **Smart Fallback**: Automatically detects API availability
- ✅ **Visual Indicator**: Shows "Demo Mode" banner when no API is connected

**Demo Mode Features:**
- 8 sample contracts across different categories
- Full CRUD operations (create, read, update, delete)
- Search and filtering functionality
- Export to markdown
- Responsive design and all UI components

**How Demo Mode Works:**
1. App tries to connect to API at `/api`
2. If API is unavailable, automatically switches to demo data
3. All operations work with in-memory demo data
4. Changes are not persisted (reset on page refresh)
5. Users can still experience the full app functionality

### Accessing Your Demo

Once deployed, your demo will be available at:
- **Main site**: `https://la3mmchen.github.io/contracts`
- **Repository**: Your GitHub repo will show a "View deployment" button

## Customization

### Changing the Base Path

If you want to deploy to a different path or custom domain:

1. Update `homepage` in `client/package.json`
2. Update `base` in `client/vite.config.ts`
3. Update the workflow file if needed

### Environment Variables

For production builds, you might want to:
- Set different API endpoints
- Configure feature flags
- Add analytics tracking

## Troubleshooting

### Common Issues

1. **Build fails**: Check the Actions tab for error logs
2. **Page not found**: Ensure GitHub Pages is enabled and set to GitHub Actions
3. **Routing issues**: Verify the base path configuration in Vite

### Checking Deployment Status

1. Go to **Actions** tab in your repository
2. Look for the latest "Deploy to GitHub Pages" workflow run
3. Check the build and deploy steps for any errors

## Security Notes

- The workflow only runs on the `main` branch
- Pull requests can't trigger deployments
- All dependencies are locked with `package-lock.json`

## Next Steps

After setup:
1. Push your changes to trigger the first deployment
2. Wait for the workflow to complete (usually 2-5 minutes)
3. Visit your demo site to verify everything works
4. Share the demo URL with others!

## Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Verify your repository settings
3. Ensure all files are committed and pushed
