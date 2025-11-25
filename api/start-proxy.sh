#!/bin/bash
# Start Cloud SQL Proxy for local development

PROJECT_ID="${GCP_PROJECT_ID:-destockify}"
INSTANCE_NAME="${CLOUD_SQL_INSTANCE:-destockify-db}"
PORT="${PROXY_PORT:-5433}"

CONNECTION_NAME="${PROJECT_ID}:us-central1:${INSTANCE_NAME}"

echo "🚀 Starting Cloud SQL Proxy..."
echo "Connection: $CONNECTION_NAME"
echo "Port: $PORT"
echo ""

# Check if proxy is already running
if ps aux | grep -q "[c]loud-sql-proxy.*${INSTANCE_NAME}"; then
  echo "⚠️  Cloud SQL Proxy is already running!"
  ps aux | grep "[c]loud-sql-proxy.*${INSTANCE_NAME}" | grep -v grep
  echo ""
  read -p "Kill existing proxy and restart? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    pkill -f "cloud-sql-proxy.*${INSTANCE_NAME}"
    sleep 1
  else
    echo "Exiting. Proxy already running."
    exit 0
  fi
fi

# Check if port is already in use
if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null 2>&1 ; then
  echo "⚠️  Port $PORT is already in use!"
  lsof -i :${PORT} | grep LISTEN
  echo ""
  read -p "Use a different port? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter port number: " PORT
  else
    echo "Exiting. Please free port $PORT or specify a different port."
    exit 1
  fi
fi

# Start proxy in background
echo "Starting proxy on port $PORT..."
LOG_FILE="/tmp/cloud-sql-proxy-${INSTANCE_NAME}.log"
cloud-sql-proxy ${CONNECTION_NAME} --port ${PORT} > ${LOG_FILE} 2>&1 &
PROXY_PID=$!

# Wait a moment for proxy to start
sleep 2

# Check if proxy started successfully
if ps -p ${PROXY_PID} > /dev/null; then
  echo "✅ Cloud SQL Proxy started successfully!"
  echo "PID: ${PROXY_PID}"
  echo "Port: ${PORT}"
  echo "Log file: ${LOG_FILE}"
  echo ""
  echo "To stop the proxy, run:"
  echo "  kill ${PROXY_PID}"
  echo "  or"
  echo "  pkill -f 'cloud-sql-proxy.*${INSTANCE_NAME}'"
  echo ""
  echo "To view logs:"
  echo "  tail -f ${LOG_FILE}"
else
  echo "❌ Failed to start Cloud SQL Proxy!"
  echo "Check logs: ${LOG_FILE}"
  tail -20 ${LOG_FILE}
  exit 1
fi



