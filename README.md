# GharSe - Home Food Pre-Order Platform 🏠🥘

GharSe is a premium MERN-stack application designed to bridge the gap between talented home chefs and food lovers. It focuses on a pre-order system with structured meals and location-based discovery.

## ✨ Key Features

- 📍 **Location-Based Discovery**: Find home chefs within a 5km radius using MongoDB GeoJSON.
- 🕒 **Cutoff-Based Pre-orders**: Order your meals before the chef's cutoff time (e.g., 10 AM for Lunch).
- 🍱 **Structured Meals**: See exactly what's in your box (e.g., 2 Roti, 100g Dal).
- ⚡ **Real-Time Updates**: Instant notifications for new orders and status changes via Socket.io.
- 📊 **Chef Analytics**: Track revenue, popular dishes, and order history with interactive charts.
- 🎨 **Premium UI/UX**: Modern, responsive design with Tailwind CSS 4 and Framer Motion.

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS 4, Framer Motion, Lucide Icons, Recharts.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io.
- **Auth**: JWT (JSON Web Tokens).

## 🚀 Getting Started

### Prerequisites

- Node.js & npm
- MongoDB instance (Local or Atlas)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository** (or navigate to the project folder).
2. **Backend Setup**:
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory and add your credentials:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Frontend Setup**:
   ```bash
   cd client
   npm install
   ```

### Running the App

1. **Start Backend**:
   ```bash
   cd server
   npm start # or node server.js
   ```

2. **Start Frontend**:
   ```bash
   cd client
   npm run dev
   ```

## 🧑‍🍳 User Roles

### Customer
- Browse nearby chefs and menus.
- View detailed meal breakdowns.
- Place pre-orders before cutoff times.
- Track order status in real-time.

### Home Chef
- Create and manage daily/weekly menus.
- Set price, quantity, and cutoff times.
- Manage incoming orders and update statuses.
- View sales analytics and revenue.

---
Built with ❤️ by Antigravity
