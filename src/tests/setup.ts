import { config } from 'dotenv'

// Load .env.test and override any existing env vars
// This ensures integration tests always use the test database
config({ path: '.env.test', override: true })
