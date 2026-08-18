#!/bin/bash
set -e

echo "=== [1C Web Publication] Starting Web Server ==="

# Find 1C installation directory
ONEC_DIR=$(find /opt/1cv8/x86_64 /opt/1C/v8.3/x86_64 -maxdepth 1 -name "8.3.*" 2>/dev/null | sort -V | tail -n 1)

if [ -z "$ONEC_DIR" ]; then
    echo "ERROR: 1C:Enterprise WS module not found."
    tail -f /dev/null
fi

WS_MODULE=$(find "$ONEC_DIR" -name "wsap24.so" -o -name "ws22.so" | head -n 1)
echo "Found 1C Apache module: $WS_MODULE"

# Prepare Web directory
mkdir -p /var/www/radcor
cp /etc/1c/default.vrd /var/www/radcor/default.vrd
chown -R www-data:www-data /var/www/radcor

# Configure Apache 1C module and directory
cat <<EOF > /etc/apache2/conf-available/1c-radcor.conf
LoadModule _1cws_module "${WS_MODULE}"

# 1C Web Client & OData / HTTP Services
Alias "/radcor" "/var/www/radcor"
<Directory "/var/www/radcor">
    AllowOverride All
    Options None
    Require all granted
    SetHandler 1c-application
    ManagedApplicationDescriptor "/var/www/radcor/default.vrd"
</Directory>
EOF

a2enconf 1c-radcor
a2enmod headers
a2enmod rewrite

# Wait for 1C Server
echo "Waiting for 1C Server ($ONEC_SERVER_HOST:$ONEC_REGPORT)..."
while ! nc -z "$ONEC_SERVER_HOST" "$ONEC_REGPORT"; do
    sleep 2
done
echo "1C Server is online."

echo "=== [1C Web Publication] Apache listening on port 8080 ==="
echo "URL Web Client: http://localhost:8080/radcor"
echo "URL OData:      http://localhost:8080/radcor/odata/standard.odata/"

exec apache2ctl -D FOREGROUND
