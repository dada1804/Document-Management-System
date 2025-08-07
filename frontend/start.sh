#!/bin/bash

echo "🚀 Starting Document Management System Frontend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Angular CLI is installed
if ! command -v ng &> /dev/null; then
    echo "🔧 Installing Angular CLI globally..."
    npm install -g @angular/cli
fi

echo "🌐 Starting development server..."
echo "📱 Frontend will be available at: http://localhost:4200"
echo "🔗 Backend should be running at: http://localhost:8080"

npm start 