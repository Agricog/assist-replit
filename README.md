# Agricog Assist

Smart farming intelligence platform

## Deploy to Railway

1. Create Railway project from this GitHub repo
2. Add PostgreSQL database
3. Add environment variables:
   - DATABASE_URL = ${{Postgres.DATABASE_URL}}
   - SESSION_SECRET = (generate random string)
   - OPENWEATHER_API_KEY = your-openweather-api-key
   - PERPLEXITY_API_KEY = your-perplexity-api-key
4. Deploy!

## Local Dev

npm install
npm run dev
