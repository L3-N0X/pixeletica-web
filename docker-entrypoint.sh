#!/bin/bash
set -e

# Replace environment variables in the built JS files
echo "Configuring Pixeletica Frontend with environment variables..."

# Find all JS files in the assets directory
JS_FILES=$(find /usr/share/nginx/html/assets -type f -name "*.js")

# Replace environment variable placeholders
for file in $JS_FILES; do
  echo "Processing: $file"
  
  # Replace API base URL if set
  if [[ -n "$API_BASE_URL" ]]; then
    sed -i "s|__PIXELETICA_API_BASE_URL__|$API_BASE_URL|g" $file
  fi

  # Replace app version if set
  if [[ -n "$APP_VERSION" ]]; then
    sed -i "s|__PIXELETICA_APP_VERSION__|$APP_VERSION|g" $file
  else
    sed -i "s|__PIXELETICA_APP_VERSION__|development|g" $file
  fi
  
  # Replace default locale if set
  if [[ -n "$DEFAULT_LOCALE" ]]; then
    sed -i "s|__PIXELETICA_DEFAULT_LOCALE__|$DEFAULT_LOCALE|g" $file
  else
    sed -i "s|__PIXELETICA_DEFAULT_LOCALE__|en|g" $file
  fi
  
  # Other environment variables can be added similarly
  
  # Remove any remaining /api default substitution
  sed -i "s|__PIXELETICA_API_BASE_URL__||g" $file

done

echo "Environment configuration complete"

# Execute the main container command
exec "$@"
