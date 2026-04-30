# MongoDB Setup Instructions

## Option 1: Install MongoDB locally (Recommended for development)

### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer and choose "Complete" installation
3. Install MongoDB Compass (optional GUI tool)
4. After installation, start MongoDB service:
   - Open Command Prompt as Administrator
   - Run: `net start MongoDB`

### Mac:
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu/Debian):
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Option 2: Use MongoDB Atlas (Cloud Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier available)
4. Get your connection string
5. Update the connection string in `config/database.js`

## Option 3: Use Docker (if you have Docker installed)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## After Setup

Once MongoDB is running, the server will automatically connect and you can:
- Add students (data will be stored in MongoDB)
- Add users (data will be stored in MongoDB)
- All CRUD operations will work with the database

## Database Structure

The application will create:
- `students` collection: Stores student information
- `users` collection: Stores user information

Both collections include timestamps for created/updated tracking.
