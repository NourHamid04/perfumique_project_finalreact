


function App() {

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


      </Routes>
   
     <Footer />
    </>
  );
}

export default App;