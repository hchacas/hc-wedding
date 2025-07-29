#!/bin/sh

echo "🚀 Starting Wedding API..."

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
echo "🎉 Starting server..."

# Start the main application
exec node src/index.js