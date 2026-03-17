# Admin Panel - Student Admission System

A standalone admin dashboard for managing student admission records.

## Features

- 🔐 Secure JWT-based authentication
- 📊 View all student admission records
- 🔍 Search and filter capabilities
- 📄 Pagination for large datasets
- 📥 Export records to CSV
- 🗑️ Delete records with confirmation
- 📱 Responsive design (desktop, tablet, mobile)
- 🔒 Comprehensive security (HTTPS, CSRF, rate limiting)

## Prerequisites

- Node.js 18+ and npm
- Backend API running (default: http://localhost:3000)

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The admin panel will be available at `http://localhost:5174`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run coverage
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000
VITE_ADMIN_SESSION_TIMEOUT=1800000
```

For production, create `.env.production`:

```env
VITE_API_URL=https://your-production-api.com
VITE_ADMIN_SESSION_TIMEOUT=1800000
```

## Deployment

This admin panel is completely standalone and can be deployed separately from the main student form application.

### Deploy to Vercel/Netlify

1. Build the project: `npm run build`
2. Deploy the `dist/` folder
3. Configure environment variables in your hosting platform

### Deploy with Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5174
CMD ["npm", "run", "preview"]
```

## Project Structure

```
admin-panel/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── test/           # Test setup and utilities
├── public/             # Static assets
├── .env                # Development environment variables
├── .env.production     # Production environment variables
└── package.json        # Dependencies and scripts
```

## Default Admin Credentials

**Important:** Change these credentials after first login!

- Username: `admin`
- Password: `admin123`

## Security Notes

- All API requests require JWT authentication
- Sessions expire after 30 minutes of inactivity
- Rate limiting: 5 login attempts per 15 minutes
- CSRF protection enabled for all state-changing operations
- HTTPS enforced in production

## License

Private - Internal Use Only
