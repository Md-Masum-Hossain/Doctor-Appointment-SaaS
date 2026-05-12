# Doctor Appointment System

Production-ready monorepo for a doctor appointment SaaS application.

## Project Structure

- `client/` - React + Vite frontend
- `server/` - Express + MongoDB backend

## Setup Guide

### 1. Prerequisites

- Node.js 18+ recommended
- MongoDB connection string
- Cloudinary account for file uploads
- A Vercel account for the frontend
- A Render account for the backend

### 2. Install Dependencies

```bash
cd server
npm install
cd ../client
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside `server/` and set the backend values below.

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
REFRESH_COOKIE_MAX_AGE_MS=604800000
CLOUDINARY_URL=your_cloudinary_url
# or use the split Cloudinary values instead of CLOUDINARY_URL
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create a `.env` file inside `client/` and set the frontend API URL.

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 4. Run the App Locally

Run the backend:

```bash
cd server
npm run dev
```

Run the frontend in a second terminal:

```bash
cd client
npm run dev
```

### 5. Production Build

Build the frontend:

```bash
cd client
npm run build
```

Run the backend in production mode:

```bash
cd server
npm start
```

## Environment Variables

### Backend

- `NODE_ENV` - runtime mode, usually `development` or `production`
- `PORT` - backend port, defaults to `5000`
- `MONGO_URI` - MongoDB connection string
- `CLIENT_URL` - comma-separated list of allowed frontend origins for CORS
- `JWT_ACCESS_SECRET` - access token signing secret
- `JWT_REFRESH_SECRET` - refresh token signing secret
- `JWT_ACCESS_EXPIRES_IN` - access token lifetime, defaults to `15m`
- `JWT_REFRESH_EXPIRES_IN` - refresh token lifetime, defaults to `7d`
- `REFRESH_COOKIE_MAX_AGE_MS` - refresh cookie lifetime in milliseconds
- `CLOUDINARY_URL` - optional single Cloudinary config URL
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name when using split config
- `CLOUDINARY_API_KEY` - Cloudinary API key when using split config
- `CLOUDINARY_API_SECRET` - Cloudinary API secret when using split config

### Frontend

- `VITE_API_BASE_URL` - backend API base URL, such as `http://localhost:5000/api/v1`

## Run Commands

### Backend

- `npm run dev` - start the backend in watch mode
- `npm start` - start the backend once

### Frontend

- `npm run dev` - start the Vite development server
- `npm run build` - create a production build
- `npm run preview` - preview the production build locally
- `npm run lint` - run ESLint

## Deployment Guide

### Deployment Targets

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

### Production Environment Examples

Use these files as the starting point for production deployments:

- [server/.env.production.example](server/.env.production.example)
- [client/.env.production.example](client/.env.production.example)

### Render Backend

- Create a new Web Service on Render.
- Set the root directory to `server`.
- Use `npm install` as the build command if Render asks for one.
- Use `npm start` as the start command.
- Add the backend environment variables listed above.
- Set `NODE_ENV=production`.
- Set `CLIENT_URL` to your deployed Vercel URL.
- Expose the health route at `/api/v1/health` for uptime checks.
- Point `MONGO_URI` to your MongoDB Atlas connection string.
- Keep the Render service running on the port provided by `PORT`.

### Vercel Frontend

- Create a new Vercel project from the `client` directory.
- Set the build command to `npm run build`.
- Set the output directory to `dist`.
- Add `VITE_API_BASE_URL` so the frontend points to the Render backend URL.
- Keep the existing `client/vercel.json` rewrite so client-side routes continue to work.
- Set the frontend URL in `CLIENT_URL` on the backend so CORS allows the Vercel domain.
- Set the root directory in Vercel to `client`.
- Make sure `VITE_API_BASE_URL` uses the Render backend URL, including `/api/v1`.

### Monorepo Deployment Notes

- Vercel root directory: `client`
- Render root directory: `server`
- The backend uses `npm start` for production.
- The frontend uses `npm run build` to produce the `dist` folder.

## Final Deployment Checklist

- [ ] MongoDB Atlas connection string is valid and reachable.
- [ ] `CLIENT_URL` on Render matches the deployed Vercel URL.
- [ ] `VITE_API_BASE_URL` on Vercel points to the Render backend `/api/v1` URL.
- [ ] Backend `NODE_ENV` is set to `production`.
- [ ] Backend secrets are strong and unique.
- [ ] Cloudinary credentials are set if image uploads are used.
- [ ] Render root directory is `server` and start command is `npm start`.
- [ ] Vercel root directory is `client` and build command is `npm run build`.
- [ ] The health endpoint responds at `/api/v1/health`.
- [ ] Protected routes still require valid auth after deployment.
- [ ] CORS allows only the production frontend URL.
- [ ] Refresh-token cookies are stored via httpOnly cookie settings.
- [ ] Client-side routing works on refresh because of the Vercel rewrite.

## Notes

- Refresh tokens are stored in httpOnly cookies and are never exposed in API responses.
- Protected routes on both the backend and frontend use role checks where required.
- The repository now includes phased features for appointments, payments, reviews, notifications, and the AI symptom checker placeholder.
