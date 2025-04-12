/**
 * Environment configuration utilities
 *
 * This module provides functions to safely access environment variables
 * and fallback to defaults when variables are not defined.
 */

// Base URL for API requests - can be overridden at runtime in Docker
// Placeholder will be replaced by docker-entrypoint.sh
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '__PIXELETICA_API_BASE_URL__';

// Application version
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '__PIXELETICA_APP_VERSION__';

// Default locale
const DEFAULT_LOCALE = import.meta.env.VITE_DEFAULT_LOCALE || '__PIXELETICA_DEFAULT_LOCALE__';

// Development mode flag
const IS_DEV = import.meta.env.DEV || false;

// Production mode flag
const IS_PROD = import.meta.env.PROD || false;

/**
 * The current environment (development, production, etc.)
 */
const ENV = import.meta.env.MODE || 'development';

/**
 * Get an environment variable with a fallback value
 */
function getEnv(key: string, fallback: string = ''): string {
  return import.meta.env[key] || fallback;
}

/**
 * Returns true if we're running inside a Docker container
 * This is determined by checking for specific environment variables
 */
function isDocker(): boolean {
  return (
    typeof process !== 'undefined' &&
    (process.env.RUNNING_IN_DOCKER === 'true' || APP_VERSION !== '__PIXELETICA_APP_VERSION__')
  );
}

export { API_BASE_URL, APP_VERSION, DEFAULT_LOCALE, ENV, IS_DEV, IS_PROD, getEnv, isDocker };
