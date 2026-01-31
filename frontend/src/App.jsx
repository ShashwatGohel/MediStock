import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import UserDashboard from "./pages/UserDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import StoreDetail from "./pages/StoreDetail";
import MyOrders from "./pages/MyOrders";
import SavedStores from "./pages/SavedStores";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import MedicineSearch from "./pages/MedicineSearch";
import UploadPrescriptionPage from "./pages/UploadPrescriptionPage";
import StoreMapPage from "./pages/StoreMapPage";
import PastOrdersPage from "./pages/PastOrdersPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="/store/:storeId" element={<StoreDetail />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/saved-stores" element={<SavedStores />} />
        <Route path="/past-orders" element={<PastOrdersPage />} />
        <Route path="/upload-rx" element={<UploadPrescriptionPage />} />
        <Route path="/map-view" element={<StoreMapPage />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/medicine/:medicineName" element={<MedicineSearch />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


