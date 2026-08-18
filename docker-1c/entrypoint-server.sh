#!/bin/bash
set -e

echo "=== [1C Server] Starting Initialization ==="

# Find 1C installation directory
ONEC_DIR=$(find /opt/1cv8/x86_64 /opt/1C/v8.3/x86_64 -maxdepth 1 -name "8.3.*" 2>/dev/null | sort -V | tail -n 1)

if [ -z "$ONEC_DIR" ]; then
    echo "ERROR: 1C:Enterprise binaries not found in /opt/1cv8/x86_64/ or /opt/1C/v8.3/x86_64/"
    echo "Please ensure 1C deb packages are placed in ./dist and the image is built properly."
    tail -f /dev/null
fi

echo "Detected 1C Enterprise binaries at: $ONEC_DIR"

# Ensure data directory exists and has correct permissions
mkdir -p /home/usr1cv8/.1cv8/1C/1cv8
mkdir -p /var/log/1C
chown -R usr1cv8:grp1cv8 /home/usr1cv8 /var/log/1C

# Wait for PostgreSQL
echo "Waiting for PostgreSQL ($DB_HOST:$DB_PORT)..."
while ! nc -z "$DB_HOST" "$DB_PORT"; do
    sleep 1
done
echo "PostgreSQL is ready."

# Start 1C Agent as usr1cv8
echo "Starting 1C ragent service..."
su - usr1cv8 -c "$ONEC_DIR/ragent -daemon -port $ONEC_PORT -regport $ONEC_REGPORT -range $ONEC_RANGE -seclev 0 -pingPeriod 1000 -pingTimeout 5000 -d /home/usr1cv8/.1cv8/1C/1cv8"

sleep 3

# Start Remote Administration Server (RAS) for automation
echo "Starting RAS on port $RAS_PORT..."
su - usr1cv8 -c "$ONEC_DIR/ras --daemon cluster --port=$RAS_PORT localhost:$ONEC_REGPORT"

sleep 2

# Initialize Infobase if needed
echo "Checking 1C Cluster and Infobase..."
CLUSTER_ID=$(su - usr1cv8 -c "$ONEC_DIR/rac cluster list localhost:$RAS_PORT" | grep "cluster " | head -n 1 | awk '{print $3}' || true)

if [ -n "$CLUSTER_ID" ]; then
    echo "Cluster ID: $CLUSTER_ID"
    
    # Check if infobase 'radcor' exists
    IB_EXISTS=$(su - usr1cv8 -c "$ONEC_DIR/rac infobase --cluster=$CLUSTER_ID summary list localhost:$RAS_PORT" | grep "name " | grep -w "$ONEC_IB_NAME" || true)
    
    if [ -z "$IB_EXISTS" ]; then
        echo "Creating infobase '$ONEC_IB_NAME' in cluster $CLUSTER_ID on PostgreSQL..."
        su - usr1cv8 -c "$ONEC_DIR/rac infobase --cluster=$CLUSTER_ID create \
            --name=$ONEC_IB_NAME \
            --descr='Radcor B2B Infobase' \
            --dbms=PostgreSQL \
            --db-server=$DB_HOST \
            --db-name=$DB_NAME \
            --db-user=$DB_USER \
            --db-pwd=$DB_PASSWORD \
            --create-database=yes \
            --locale=ru_RU \
            localhost:$RAS_PORT" || echo "Warning: RAC infobase create command finished with warning/notice."
        echo "Infobase '$ONEC_IB_NAME' created successfully."
    else
        echo "Infobase '$ONEC_IB_NAME' already exists."
    fi
fi

echo "=== [1C Server] Running and listening on ports $ONEC_PORT, $ONEC_REGPORT, $RAS_PORT ==="

# Tail logs to keep container alive and provide live diagnostics
touch /var/log/1C/server.log
tail -f /var/log/1C/server.log /dev/null
