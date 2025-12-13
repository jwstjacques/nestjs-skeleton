#!/bin/bash

echo "Testing rate limiting..."
echo "Sending 15 POST requests to /api/v1/tasks"
echo "Expected: First 10 succeed, then 429 errors"
echo ""

for i in {1..15}
do
  echo "Request $i:"
  curl -X POST http://localhost:3000/api/v1/tasks \
    -H "Content-Type: application/json" \
    -d "{\"title\": \"Rate Limit Test $i\", \"priority\": \"MEDIUM\"}" \
    -w "\nStatus: %{http_code}\n" \
    -s | head -n 1
  echo "---"
  sleep 0.05
done
