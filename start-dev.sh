#!/bin/bash
# Script to start the dev server with proper network settings

# Force Node.js to prefer IPv4 over IPv6
export NODE_OPTIONS="--dns-result-order=ipv4first"

# Clear any proxy settings
unset HTTPS_PROXY 2>/dev/null
unset HTTP_PROXY 2>/dev/null

npm run dev
