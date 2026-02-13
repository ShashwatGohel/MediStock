# MediStock 🏥💊

**MediStock** is a comprehensive **Medical Inventory & Order Management System** designed to bridge the gap between local pharmacies and customers. It empowers store owners to manage their inventory, sales, and orders efficiently while providing users with a seamless platform to find and order medicines from nearby stores.

## 🚀 Key Features

### 👤 For Users (Customers)
- **Medicine Search**: Find medicines globally or by category.
- **Store Locator**: View nearby pharmacies on an interactive map 🗺️.
- **Order Placement**:
    - **Quick Order**: Order directly from search results.
    - **Cart System**: Add multiple items and checkout.
    - **Prescription Upload**: Upload prescriptions for verification 📄.
- **Real-time Updates**: Status tracking for orders (Pending -> Approved -> Confirmed -> Delivered).
- **Bill Management**: View purchase history and digital bills.

### 🏪 For Store Owners (Pharmacists)
- **Owner Dashboard**: Real-time overview of **Total Sales**, **Orders**, **Low Stock**, and **Profile Visits**.
    - **Performance Analytics**: Detailed breakdown of daily sales (Cash vs. Digital, Items Sold) 📊.
- **Inventory Management**: Add, update, and delete medicines. Bulk upload via Excel supported 📥.
- **Order Processing**: Accept/Reject orders with real-time status updates via Socket.io.
- **Billing System**: Built-in POS (Point of Sale) to generate verified digital bills for walk-in customers 🧾.
- **Sales Reports**: Track daily, weekly, and monthly sales performance.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: [React.js](https://react.dev/) (Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State/Routing**: React Router DOM, Context API
- **Animations**: Framer Motion
- **Maps**: Leaflet / React-Leaflet
- **Notifications**: React Hot Toast
- **PDF Generation**: jsPDF (for bills)

### **Backend**
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://express.js.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Real-time**: [Socket.io](https://socket.io/) (for order updates)
- **Authentication**: JWT (JSON Web Tokens)
- **File Handling**: Multer (images), XLSX (bulk upload)

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas URL)

### 1. Clone the Repository
```bash
git clone https://github.com/ShashwatGohel/MediStock.git
cd MediStock
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```
Start the backend server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend folder, and install dependencies:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory (optional if using defaults):
```env
VITE_API_URL=http://localhost:5000
```
Start the frontend development server:
```bash
npm run dev
# App runs on http://localhost:5173
```

---

## 📱 Usage
1.  **Register**: Create an account as a **User** or **Store Owner**.
2.  **Store Setup**: If you are a store owner, complete your profile (Location, Opening Hours).
3.  **Add Inventory**: Upload medicines to your store.
4.  **Explore**: As a user, search for medicines and place orders!

## 🤝 Contribution
Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License
This project is licensed under the ISC License.
