#!/bin/bash

# Payroll & HR Management System - Easy Setup Script
# This script automates the setup process for the payroll system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Payroll & HR System - Easy Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}Error: MySQL is not installed${NC}"
    echo "Please install MySQL from https://www.mysql.com/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js detected: $(node --version)${NC}"
echo -e "${GREEN}✓ MySQL detected${NC}"
echo ""

# Function to prompt for configuration
get_config() {
    echo -e "${YELLOW}Enter MySQL configuration (or press Enter for defaults):${NC}"
    read -p "Database Host [localhost]: " DB_HOST
    DB_HOST=${DB_HOST:-localhost}
    
    read -p "Database Port [3306]: " DB_PORT
    DB_PORT=${DB_PORT:-3306}
    
    read -p "Database Name [payroll_hr]: " DB_NAME
    DB_NAME=${DB_NAME:-payroll_hr}
    
    read -p "MySQL Username [root]: " DB_USER
    DB_USER=${DB_USER:-root}
    
    read -s -p "MySQL Password [root]: " DB_PASSWORD
    DB_PASSWORD=${DB_PASSWORD:-root}
    echo ""
    
    read -p "Server Port [5000]: " SERVER_PORT
    SERVER_PORT=${SERVER_PORT:-5000}
}

# Function to create .env file
create_env() {
    cat > backend/.env << EOF
# Database Configuration
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# JWT Configuration
JWT_SECRET=payroll_hr_secret_key_$(date +%Y)
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=${SERVER_PORT}
NODE_ENV=development
EOF
    echo -e "${GREEN}✓ Created backend/.env${NC}"
}

# Main setup flow
echo -e "${YELLOW}Step 1: Installing backend dependencies...${NC}"
cd backend
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

echo -e "${YELLOW}Step 2: Installing frontend dependencies...${NC}"
cd ../frontend
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

# Ask about database configuration
echo -e "${YELLOW}Step 3: Database Configuration${NC}"
read -p "Do you want to configure MySQL now? (y/n): " CONFIG_MYSQL
if [ "$CONFIG_MYSQL" = "y" ] || [ "$CONFIG_MYSQL" = "Y" ]; then
    get_config
    create_env
    
    echo ""
    echo -e "${YELLOW}Step 4: Setting up database...${NC}"
    cd ../backend
    
    # Test MySQL connection
    echo "Testing MySQL connection..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Could not connect to MySQL${NC}"
        echo "Please check your credentials and try again."
        exit 1
    fi
    echo -e "${GREEN}✓ MySQL connection successful${NC}"
    
    # Create database
    echo "Creating database..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};"
    echo -e "${GREEN}✓ Database '${DB_NAME}' created${NC}"
    
    # Sync database (create tables)
    echo "Creating database tables..."
    node utils/syncDatabase.js
    echo -e "${GREEN}✓ Tables created${NC}"
    
    # Seed database (add sample data)
    read -p "Do you want to seed sample data? (y/n): " SEED_DATA
    if [ "$SEED_DATA" = "y" ] || [ "$SEED_DATA" = "Y" ]; then
        echo "Seeding sample data..."
        node utils/seedDatabase.js
        echo -e "${GREEN}✓ Sample data seeded${NC}"
    fi
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Setup Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "To start the application:"
echo ""
echo -e "  ${GREEN}Terminal 1 (Backend):${NC}"
echo -e "    cd backend"
echo -e "    npm run dev"
echo ""
echo -e "  ${GREEN}Terminal 2 (Frontend):${NC}"
echo -e "    cd frontend"
echo -e "    npm start"
echo ""
echo -e "  ${GREEN}Access the application:${NC}"
echo -e "    Frontend: http://localhost:3000"
echo -e "    Backend:  http://localhost:5000"
echo ""
echo -e "${YELLOW}Default Login Credentials:${NC}"
echo -e "  Admin:    admin / admin123"
echo -e "  HR:       hr / hr123"
echo -e "  Manager:  manager / manager123"
echo -e "  Employee: employee / employee123"
echo ""
