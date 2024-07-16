import { BrowserRouter, Routes, Route, Router, Link } from "react-router-dom";
import './App.css';
import CreateRoom from "./routes/CreateRoom";
import Room from "./routes/Room.js";

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route exact path="/" Component={CreateRoom}></Route>
      <Route exact path="/room/:roomID" Component={Room}></Route>
    </Routes>
    </BrowserRouter>
  );
}

export default App;
