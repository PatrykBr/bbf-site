import { initializeRateLimit } from "../lib/rate-limit.ts";

await initializeRateLimit();
console.info("Turso: the contact rate-limit table and expiry index are ready.");
