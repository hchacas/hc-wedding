#!/bin/sh

echo "🚀 Starting Wedding API..."

# Fix data directory ownership so appuser can write to the named volume.
# This is necessary because Docker named volumes are created as root:root on
# first mount, while the app runs as appuser (UID 100). The container starts
# as root and drops privileges at the end of this script via su-exec.
chown -R appuser:appgroup /app/data 2>/dev/null || true

# Set database path for production
DB_PATH="/app/data/wedding.db"

# Check if database exists and is initialized
if [ ! -f "$DB_PATH" ]; then
    echo "📊 Database not found. Initializing..."
    node scripts/init-db.js
    
    # Create default admin if none exists
    echo "👤 Creating default admin..."
    node scripts/create-admin.js
else
    echo "📊 Database exists. Checking initialization..."
    
    # Check if tables exist by trying to count admins
    ADMIN_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM admins;" 2>/dev/null || echo "0")
    
    if [ "$ADMIN_COUNT" = "0" ]; then
        echo "👤 No admin found. Creating default admin..."
        node scripts/create-admin.js
    else
        echo "👤 Admin exists. Skipping admin creation."
    fi
    
    # Check if invitations exist
    INVITATION_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM invitations;" 2>/dev/null || echo "0")
    
    if [ "$INVITATION_COUNT" = "0" ]; then
        echo "📧 No invitations found. Creating sample invitations..."
        node scripts/init-db.js
    else
        echo "📧 Invitations exist. Skipping sample data creation."
    fi
fi

echo "✅ Database initialization complete"
echo "🎉 Starting server as appuser..."

# Drop from root to appuser and exec the application
exec su-exec appuser node src/index.js