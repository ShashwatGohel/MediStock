# MediStock 🏥💊

**MediStock** is a full-stack **Medical Inventory & Order Management System** that connects **local pharmacies** with **customers**.  
It helps store owners manage inventory, orders, and billing while allowing users to easily search and order medicines from nearby stores.

🌐 **Live App:** https://medi-stock-theta.vercel.app/

---

## 🚀 Key Features

### 👤 For Users (Customers)

- 🔍 **Medicine Search** — Search medicines globally or by category  
- 🗺️ **Store Locator** — View nearby pharmacies on an interactive map  
- 🛒 **Multiple Ordering Options**
  - **Quick Order** directly from search
  - **Cart System** for multiple medicines
  - **Prescription Upload** for restricted medicines 📄
- 🔔 **Real-Time Order Tracking**  
  Status updates: **Pending → Approved → Confirmed → Delivered**
- 🧾 **Bill Management** — View order history and digital bills

---

### 🏪 For Store Owners (Pharmacists)

- 📊 **Owner Dashboard**
  - Total Sales
  - Total Orders
  - Low Stock Alerts
  - Profile Visits
- 📈 **Performance Analytics**
  - Daily sales breakdown
  - Cash vs Digital payments
  - Items sold
- 💊 **Inventory Management**
  - Add / Edit / Delete medicines
  - Bulk upload using Excel 📥
- 📦 **Order Processing**
  - Accept / Reject orders
  - Real-time updates via Socket.io
- 🧾 **Built-in Billing (POS System)**
  - Generate digital bills for walk-in customers
- 📅 **Sales Reports**
  - Daily, Weekly, Monthly insights

---

## 🛠️ Tech Stack

### 🎨 Frontend
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS
- **Routing & State:** React Router DOM, Context API
- **Animations:** Framer Motion
- **Maps:** Leaflet / React-Leaflet
- **Notifications:** React Hot Toast
- **PDF Generation:** jsPDF

### ⚙️ Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Real-time:** Socket.io
- **Authentication:** JWT (JSON Web Tokens)
- **File Handling:** Multer (images), XLSX (bulk upload)

---

## ☁️ Deployment

| Service      | Platform | Description |
|-------------|----------|-------------|
| **Frontend** | Vercel   | React app hosting |
| **Backend**  | Render  | API server |
| **Database** | MongoDB Atlas | Cloud database |

---

## ⚙️ Installation & Local Setup

### 📌 Prerequisites
- Node.js (v16+ recommended)
- MongoDB (Local or Atlas)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ShashwatGohel/MediStock.git
cd MediStock
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

Run the backend:

```bash
npm run dev
```

Server runs at 👉 `http://localhost:5000`

---

### 3️⃣ Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder (optional):

```env
VITE_API_URL=http://localhost:5000
```

Run the frontend:

```bash
npm run dev
```

App runs at 👉 `http://localhost:5173`

---

## 📱 How to Use

1. **Register** as a **Customer** or **Store Owner**
2. Store owners complete their **store profile**
3. Add medicines to inventory
4. Customers search for medicines & place orders
5. Track orders in real-time

---

## 🔐 Roles in the System

| Role | Permissions |
|------|-------------|
| **Customer** | Search, Order, Upload Prescription, Track Orders |
| **Store Owner** | Manage Inventory, Process Orders, Generate Bills, View Analytics |

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo  
2. Create a feature branch  
3. Commit your changes  
4. Open a Pull Request 🚀  

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Developer

Built with ❤️ by **Shashwat Gohel**  
B.Tech CSE Student | Full Stack Developer | Ahmedabad University
