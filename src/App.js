import { BrowserRouter, Routes, Route, Router, Link } from "react-router-dom";
import './App.css';
import CreateRoom from "./routes/CreateRoom";
import Room from "./routes/Room.js";
import ServerUserRoom from "./routes/ServerUserRoom.js";
import ServerMentorRoom from "./routes/ServerMentorRoom.js";

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route exact path="/" Component={CreateRoom}></Route>
      <Route exact path="/peer-room/:roomID" Component={Room}></Route>
      <Route exact path="/server-user-room/:roomID" Component={ServerUserRoom}></Route>
      <Route exact path="/server-mentor-room/:roomID" Component={ServerMentorRoom}></Route>
    </Routes>
    </BrowserRouter>
  );
}

export default App;
