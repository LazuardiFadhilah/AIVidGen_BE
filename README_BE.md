# AIVidGen Backend API 🎬

AIVidGen is an AI-powered video script generation tool. This backend API handles user authentication, connects with OpenAI's GPT-4o to generate structured video scripts, and persists the data in MongoDB.

## 🚀 Features

- **User Auth**: JWT-based Authentication (Register/Login).
- **AI Generation**: Structured JSON output for video scripts (Title, Full Script, Scenes).
- **History Management**: Save, retrieve, and delete generated scripts.
- **Database**: MongoDB integration for persistent storage.
- **Deployment Ready**: Optimized for local development and Vercel deployment.

## 🛠️ Tech Stack

- **Node.js** & **Express**
- **MongoDB** & **Mongoose**
- **OpenAI API** (GPT-4o)
- **JSON Web Token (JWT)**
- **Nodemon** (Development)

---

## 💻 Getting Started

### 1. Prerequisites
- Node.js (v20 or later)
- MongoDB account (Atlas or Local)
- OpenAI API Key

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/YOUR_USERNAME/aividgen_be.git
cd aividgen_be
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_key
FRONTEND_URL=http://localhost:3000
PORT=5000
```

### 4. Database Seeding
To populate the database with initial test users and sample generations:
```bash
npm run seed
```

### 5. Running the App
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

---

## 📋 Test Credentials

You can use these credentials to test the API after running the seed script:

| Name | Email | Password |
| :--- | :--- | :--- |
| **John Doe** | `john@example.com` | `password123` |
| **Jane Smith** | `jane@example.com` | `password123` |

---

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile (Protected)

### Generation
- `POST /api/generate` - Generate a new video script (Protected)

### History
- `GET /api/history` - Get all user generations (Protected)
- `GET /api/history/:id` - Get specific generation detail (Protected)
- `DELETE /api/history/:id` - Delete a generation (Protected)

---

## 📄 Postman Collection
A Postman collection is included in the root as `AIVidGen_API.postman_collection.json` for easy testing.

---

## 📝 License
ISC
