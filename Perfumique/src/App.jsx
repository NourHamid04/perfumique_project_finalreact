import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"; // Import useLocation inside BrowserRouter
import Navbar from './Componenets/Navbar';
import Home from './Componenets/Home';
import Shop from './Componenets/Shop';
import About from './Componenets/About';
import Contact from './Componenets/Contact';
import ItemDetails from './Componenets/ItemDetails';
import NotFound from './Componenets/NotFound';
import Register from './Componenets/Register';
import Login from './Componenets/Login';
import Admin from './Componenets/Admin';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Footer from './Componenets/Footer';
import Cart from "./Componenets/Cart";
import Checkout from "./Componenets/Checkout";
import UserProfile from "./Componenets/UserProfile"; 
import ProtectedRoute from "./Componenets/ProtectedRoute";
function App() {
  AOS.init();

  return (
    <BrowserRouter>
      <AppContent /> {/* Move useLocation inside a child component */}
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation(); // Now it's inside BrowserRouter

  // Hide Footer if on an Admin Page
  const isAdminPage = location.pathname.startsWith("/admin");
  return (
    <>
      {!isAdminPage && <Navbar />}
      
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/shop/:id" element={<ItemDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Show Footer only if NOT in admin pages */}
      {!isAdminPage && <Footer />}
    </>
  );
}

export default App;
