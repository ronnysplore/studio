#!/bin/bash

echo "🔍 Testing network connectivity to Google OAuth endpoints..."
echo ""

echo "1️⃣  Testing Google Accounts (accounts.google.com):"
curl -I -m 5 https://accounts.google.com 2>&1 | head -n 1
echo ""

echo "2️⃣  Testing Google OAuth2 (oauth2.googleapis.com):"
curl -I -m 5 https://oauth2.googleapis.com 2>&1 | head -n 1
echo ""

echo "3️⃣  Testing Google APIs (www.googleapis.com):"
curl -I -m 5 https://www.googleapis.com 2>&1 | head -n 1
echo ""

echo "✅ If you see 'HTTP/2 200' or '301/302' responses above, connections work!"
echo "❌ If you see 'timeout' or 'failed', your firewall is blocking outbound HTTPS"
echo ""
echo "🔧 To fix:"
echo "   - Whitelist outbound HTTPS (port 443) to:"
echo "     • accounts.google.com"
echo "     • oauth2.googleapis.com"
echo "     • www.googleapis.com"
