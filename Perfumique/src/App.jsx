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



  return (
    <>
      <Navbar />
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
   
     <Footer />
    </>
  );
}

export default App;