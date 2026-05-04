import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PageHome from "./Page/PageHome";
import DjikstraMax from "./Page/DjikstraMax";
import DjikstraMin from "./Page/DjikstraMin";
import Nav from "./Menu/Nav";

function App() {
  

  return (
    <>
    <Router>
      <Routes>
      
        <Route element={<Nav />}>
            <Route path="/" element={<PageHome />} />
            <Route path="/min" element={<DjikstraMin />} />
            <Route path="/max"  element={<DjikstraMax />}/>
        </Route>


      </Routes>
    </Router>
    </>
  );
}

export default App
