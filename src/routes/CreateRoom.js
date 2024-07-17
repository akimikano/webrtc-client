import React from "react";
import { v1 as uuid } from "uuid";

const CreateRoom = (props) => {
    function create_peer_room() {
        const id = uuid();
        window.location.pathname += "peer-room/" + id;
    }

    function create_server_user_room() {
        const id = uuid();
        window.location.pathname += "server-user-room/" + id;
    }

    function create_server_mentor_room() {
        const id = uuid();
        window.location.pathname += "server-mentor-room/" + id;
    }

    return (
        <div>
            <button onClick={create_peer_room}>Create Peer Room</button>
            <button onClick={create_server_user_room}>Create Server User Room</button>
            <button onClick={create_server_mentor_room}>Create Server Mentor Room</button>
        </div>
    );
}

export default CreateRoom;