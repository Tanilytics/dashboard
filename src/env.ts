import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    SERVER_URL: z.string().url().optional(),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: 'VITE_',

  client: {
    VITE_APP_TITLE: z.string().min(1).optional(),

    // Auth API endpoints (localhost:8082)
    VITE_API_AUTH_LOGIN_URL: z.string().url().optional(),
    VITE_API_AUTH_REGISTER_URL: z.string().url().optional(),
    VITE_API_AUTH_REFRESH_URL: z.string().url().optional(),

    // Sites API endpoints (localhost:8081)
    VITE_API_SITES_LIST_URL: z.string().url().optional(),
    VITE_API_SITES_CREATE_URL: z.string().url().optional(),
    VITE_API_SITES_SETTINGS_URL: z.string().url().optional(),
    VITE_API_SITES_API_KEY_ROTATE_URL: z.string().url().optional(),
    VITE_API_SITES_MEMBERS_URL: z.string().url().optional(),

    // Analytics API endpoints (localhost:8081)
    VITE_API_ANALYTICS_REALTIME_URL: z.string().url().optional(),
    VITE_API_ANALYTICS_AGGREGATE_URL: z.string().url().optional(),
    VITE_API_ANALYTICS_TIMESERIES_URL: z.string().url().optional(),
    VITE_API_ANALYTICS_PAGES_URL: z.string().url().optional(),
    VITE_API_ANALYTICS_REFERRERS_URL: z.string().url().optional(),
    VITE_API_ANALYTICS_MEDIA_URL: z.string().url().optional(),
    VITE_API_ANALYTICS_STREAM_URL: z.string().url().optional(),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: import.meta.env,

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
})
