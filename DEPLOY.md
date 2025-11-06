# Heroku Deployment Guide

## Prerequisites

1. Create a [Heroku account](https://signup.heroku.com/) if you don't have one
2. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

## Deployment Steps

### 1. Login to Heroku

```bash
heroku login
```

### 2. Create a New Heroku App

```bash
heroku create your-casino-app-name
```

Or let Heroku generate a random name:

```bash
heroku create
```

### 3. Set Environment Variables

Set a secure JWT secret:

```bash
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
```

### 4. Deploy to Heroku

```bash
git push heroku main
```

If you're on a different branch (e.g., `master`):

```bash
git push heroku master
```

### 5. Open Your App

```bash
heroku open
```

## Environment Variables

The following environment variables can be configured:

- `JWT_SECRET` (required): Secret key for JWT token generation
- `PORT` (automatic): Heroku automatically sets this
- `NODE_ENV` (optional): Set to `production` for production environment

To set environment variables:

```bash
heroku config:set VARIABLE_NAME=value
```

To view all environment variables:

```bash
heroku config
```

## Database

The application currently uses SQLite for local development. For production on Heroku:

- The SQLite database will work but is ephemeral (resets on dyno restart)
- For persistent data, consider upgrading to PostgreSQL:

```bash
heroku addons:create heroku-postgresql:mini
```

Then update the database configuration in your app to use PostgreSQL when available.

## Monitoring

View logs:

```bash
heroku logs --tail
```

Check app status:

```bash
heroku ps
```

## Scaling

Scale your app (if needed):

```bash
heroku ps:scale web=1
```

## Custom Domain

Add a custom domain:

```bash
heroku domains:add www.your-domain.com
```

## Troubleshooting

### App Crashed

Check logs for errors:

```bash
heroku logs --tail
```

### Database Issues

Ensure the data directory exists and has proper permissions. For persistent storage, use PostgreSQL.

### Port Issues

Heroku automatically assigns a port via the `PORT` environment variable. Make sure your server.js uses:

```javascript
const PORT = process.env.PORT || 3000;
```

## Useful Commands

- Restart app: `heroku restart`
- Run bash console: `heroku run bash`
- View app info: `heroku info`
- View releases: `heroku releases`
- Rollback to previous version: `heroku rollback`

## One-Click Deploy

You can also deploy directly from GitHub using this button:

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Support

For more information, visit the [Heroku Node.js Documentation](https://devcenter.heroku.com/articles/getting-started-with-nodejs).
