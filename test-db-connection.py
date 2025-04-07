import os
import psycopg2

# Print environment variables for debugging
print("Environment variables:")
print(f"DATABASE_URL: {os.environ.get('DATABASE_URL', 'Not set')}")
print(f"PGHOST: {os.environ.get('PGHOST', 'Not set')}")
print(f"PGPORT: {os.environ.get('PGPORT', 'Not set')}")
print(f"PGUSER: {os.environ.get('PGUSER', 'Not set')}")
print(f"PGDATABASE: {os.environ.get('PGDATABASE', 'Not set')}")
print(f"PGPASSWORD: {'Set' if os.environ.get('PGPASSWORD') else 'Not set'}")

try:
    # Try to connect using DATABASE_URL if available
    if 'DATABASE_URL' in os.environ and os.environ['DATABASE_URL']:
        print("\nTrying to connect using DATABASE_URL...")
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        print("Connected successfully using DATABASE_URL!")
    # Otherwise try connecting using individual parameters
    elif all(k in os.environ for k in ['PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE']):
        print("\nTrying to connect using individual parameters...")
        conn = psycopg2.connect(
            host=os.environ['PGHOST'],
            port=os.environ['PGPORT'],
            user=os.environ['PGUSER'],
            password=os.environ['PGPASSWORD'],
            dbname=os.environ['PGDATABASE']
        )
        print("Connected successfully using individual parameters!")
    else:
        print("\nCannot connect: Missing required environment variables")
        exit(1)
        
    # Test the connection
    cursor = conn.cursor()
    cursor.execute('SELECT version();')
    db_version = cursor.fetchone()
    print(f"Database version: {db_version[0]}")
    
    # List tables
    cursor.execute("""
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
    """)
    tables = cursor.fetchall()
    print("\nDatabase tables:")
    for table in tables:
        print(f"- {table[0]}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error connecting to the database: {e}")