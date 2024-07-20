import React, { useRef, useEffect } from "react";
import {useParams} from "react-router-dom";


const ServerUserRoom = (props) => {
  	const params = useParams();
    const partnerVideoRef = useRef();
	const socketRef = useRef();
	const localPeerRef = useRef();
	const wsUrl = "wss://akimikano.de/ws/user-room/"
	const stunServers = [
			{
				urls: "stun:stun.l.google.com:19302"
			},
			{
				urls: 'turn:akimikano.de:3478',
				credential: 'test',
				username: 'test'
			}
	];

    useEffect(() => {
		console.log("use effect")

		// navigator.mediaDevices.getUserMedia({audio: true})
		// .then(stream => {
		// 	createPeer(stream);
		// 	userVideoRef.current.srcObject = stream;
		// })
		// .then(() => {
		// 	createWebsocket();
		// })
		// .then(() => {
		// 	setTimeout(sendOffer, 2000)
		// 	// sendOffer();
		// });

		createPeer();
		createWebsocket();

	}, []);

	function createPeer(stream) {
		let pc = new RTCPeerConnection(stunServers);
		pc.addTransceiver("video", {direction: "recvonly"});
		pc.addTransceiver("audio", {direction: "recvonly"});

		pc.onicecandidate = event => {
			console.log("onicecandidate")
			if (event.candidate) {
				console.log("Ice candidate: ", event.candidate);
			}
		};

		pc.ontrack = event => {
			console.log("On track: ", event.streams[0].id, event.streams[0].active);
			partnerVideoRef.current.srcObject = event.streams[0];
		};

		// stream.getTracks().forEach(track => pc.addTrack(track, stream));

		pc.onconnectionstatechange = event => {
			console.log("Connection state change: ", pc.connectionState)
		};

		localPeerRef.current = pc;
		console.log("Transceivers: ", pc.getTransceivers())
	};

	function sendOffer() {
		localPeerRef.current.createOffer()
		  .then(offer => localPeerRef.current.setLocalDescription(offer))
		  .then(() => {
			  socketRef.current.send(JSON.stringify(localPeerRef.current.localDescription));
		  })
		  .catch(error => console.error('Error creating offer.', error));
	};

	function takeAnswer(answer) {
	  localPeerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
	};

	function createWebsocket() {
		socketRef.current = new WebSocket(wsUrl + params.roomID);
		socketRef.current.addEventListener("open", event => {
			socketRef.current.addEventListener("message", event => {
				const server_data = JSON.parse(event.data);

				console.log("Message from server ", server_data)

				if (server_data.type === "answer") {
					takeAnswer(server_data);
				}
			});

			sendOffer()
		});

		console.log("Method: createWebsocket")
	};

    return (
        <div>
            <video autoPlay ref={partnerVideoRef} />
        </div>
    );
}

export default ServerUserRoom;
