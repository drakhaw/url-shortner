#!/bin/bash

echo "🔐 Google OAuth Setup for URL Shortener"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f backend/.env ]; then
    echo "❌ Error: backend/.env file not found!"
    echo "Please make sure you're running this from the project root directory."
    exit 1
fi

echo "This script will help you configure Google OAuth credentials."
echo "Make sure you have already created OAuth credentials in Google Cloud Console."
echo ""
echo "📋 Need help setting up Google OAuth? Check GOOGLE_OAUTH_SETUP.md"
echo ""

# Ask for Google Client ID
echo "🔑 Enter your Google Client ID:"
echo "(It should end with .apps.googleusercontent.com)"
read -p "Google Client ID: " client_id

if [ -z "$client_id" ]; then
    echo "❌ Client ID cannot be empty!"
    exit 1
fi

# Ask for Google Client Secret
echo ""
echo "🔐 Enter your Google Client Secret:"
echo "(This is a shorter alphanumeric string)"
read -s -p "Google Client Secret: " client_secret
echo ""

if [ -z "$client_secret" ]; then
    echo "❌ Client Secret cannot be empty!"
    exit 1
fi

# Create backup of current .env
cp backend/.env backend/.env.backup
echo "📄 Created backup: backend/.env.backup"

# Update the .env file
sed -i.tmp "s/GOOGLE_CLIENT_ID=\"your_google_client_id_here\"/GOOGLE_CLIENT_ID=\"$client_id\"/" backend/.env
sed -i.tmp "s/GOOGLE_CLIENT_SECRET=\"your_google_client_secret_here\"/GOOGLE_CLIENT_SECRET=\"$client_secret\"/" backend/.env
rm backend/.env.tmp

echo ""
echo "✅ OAuth credentials updated successfully!"
echo ""

# Ask if user wants to restart the backend
read -p "🔄 Would you like to restart the backend container now? (y/n): " restart_choice

if [ "$restart_choice" = "y" ] || [ "$restart_choice" = "Y" ]; then
    echo ""
    echo "🔄 Restarting backend container..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose restart backend
    elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
        docker compose restart backend
    else
        echo "❌ Docker Compose not found. Please restart manually:"
        echo "   sudo docker compose restart backend"
        exit 1
    fi
    
    echo "✅ Backend restarted!"
else
    echo "⚠️  Don't forget to restart the backend when ready:"
    echo "   sudo docker compose restart backend"
fi

echo ""
echo "🎉 Google OAuth setup complete!"
echo ""
echo "Next steps:"
echo "1. Visit http://localhost:3000/login"
echo "2. Click 'Sign in with Google'"
echo "3. Complete the OAuth flow"
echo ""
echo "📝 Note: New users need to be invited by a super admin first."
echo "   Use the super admin account to invite users at http://localhost:3000/users"
echo ""
echo "🔍 Troubleshooting: Check GOOGLE_OAUTH_SETUP.md for common issues"