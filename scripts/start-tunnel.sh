#!/bin/bash

# Script to create a tunnel for iOS Simulator to access external server
# This allows the iOS Simulator to access your external server through localhost

echo "Starting tunnel for iOS Simulator..."
echo "This will create a local tunnel to your server at 31.97.217.79:8080"
echo "The app will be able to access the server via localhost:8080"

# Check if socat is installed
if ! command -v socat &> /dev/null; then
    echo "socat is not installed. Installing via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install socat
    else
        echo "Please install socat manually or install Homebrew first"
        exit 1
    fi
fi

# Create the tunnel
echo "Creating tunnel from localhost:8080 to 31.97.217.79:8080"
echo "Press Ctrl+C to stop the tunnel"
socat TCP-LISTEN:8080,fork TCP:31.97.217.79:8080
