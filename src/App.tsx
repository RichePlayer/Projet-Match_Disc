import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Connexion/Login";
import SigunUp from "./Connexion/SigunUp";
import PageHome from "./Page/PageHome";
import DjikstraMax from "./Page/DjikstraMax";
import DjikstraMin from "./Page/DjikstraMin";
import Nav from "./Menu/Nav";

function App() {
  

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={< Login />}/>
        <Route path="/signup" element={<SigunUp />}/>

        <Route element={<Nav />}>
            <Route path="/home" element={<PageHome />} />
            <Route path="/min" element={<DjikstraMin />} />
            <Route path="/max"  element={<DjikstraMax />}/>
        </Route>


      </Routes>
    </Router>
    </>
  );
}

export default App
