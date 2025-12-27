#!/bin/bash
echo "Building backend with TypeScript transpilation only..."
npx tsc --noEmitOnError false --skipLibCheck true
echo "Build completed with warnings (errors ignored)"