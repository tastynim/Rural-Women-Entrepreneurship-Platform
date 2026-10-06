import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import MouseEffect from "./components/MouseEffect";
import InteractiveDots from "./components/InteractiveDots";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import ProductDetail from "./pages/ProductDetail";
import Analytics from "./pages/Analytics";
import Reviews from "./pages/Reviews";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import AdminPanel from "./pages/AdminPanel";
import SuccessStories from "./pages/SuccessStories";
import Forum from "./pages/Forum";
import Mentorship from "./pages/Mentorship";
import Resources from "./pages/Resources";
import SkillCertification from "./pages/SkillCertification";
import Payment from "./pages/Payment";
import Chat from "./pages/Chat";

function App() {
  useEffect(() => {
    const update = (e) => {
      document.documentElement.style.setProperty('--mx', `${e.clientX}px`)
      document.documentElement.style.setProperty('--my', `${e.clientY}px`)
    }
    window.addEventListener('mousemove', update)
    return () => window.removeEventListener('mousemove', update)
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f0fdf4] relative">
        <InteractiveDots />
        <MouseEffect />
        <Navbar />
        <div className="relative z-10">
          <Routes>
          <Route path="/" element={<Navigate to="/products" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/add" element={<ProductForm />} />
          <Route path="/products/edit/:id" element={<ProductForm />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderTracking />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/mentorship" element={<Mentorship />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/skill-certification" element={<SkillCertification />} />
          <Route path="/payment" element={<Payment />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
