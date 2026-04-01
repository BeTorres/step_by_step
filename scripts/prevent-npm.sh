#!/bin/bash

# Prevent npm usage in this project
# This script ensures only pnpm is used

if command -v npm &> /dev/null; then
    # Check if npm is being run
    if [[ "$0" == "npm" ]] || [[ "$*" == *"npm"* ]]; then
        echo "ERROR: This project uses pnpm, not npm!"
        echo ""
        echo "Please use pnpm commands instead:"
        echo "  pnpm install    → Install dependencies"
        echo "  pnpm dev        → Start development servers"
        echo "  pnpm build      → Build for production"
        echo "  pnpm test       → Run tests"
        echo ""
        echo "To install pnpm globally:"
        echo "  npm install -g pnpm"
        exit 1
    fi
fi
