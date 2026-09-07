import { BrowserRouter, Routes, Route } from "react-router-dom";
import Password from "./pages/Password";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Stores from "./pages/Stores";
import Admin from "./pages/Admin";
import Owner from "./pages/Owner";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/stores" element={<Stores />} />

        <Route path="/admin" element={<Admin />} />

        <Route path="/owner" element={<Owner />} />
        <Route path="/password" element={<Password />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;