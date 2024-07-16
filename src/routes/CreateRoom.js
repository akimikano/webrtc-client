import React from "react";
import { v1 as uuid } from "uuid";

const CreateRoom = (props) => {
    function create() {
        const id = uuid();
        window.location.pathname += "room/" + id;
    }

    return (
        <button onClick={create}>Create Room</button>
    );
}

export default CreateRoom;