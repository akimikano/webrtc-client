import React, { useRef, useEffect } from "react";
import {useParams} from "react-router-dom";


const Room = (props) => {
  	const params = useParams()
	const userVideoRef = useRef();
    const partnerVideoRef = useRef();
	const socketRef = useRef();
	const localPeerRef = useRef();
	const wsUrl = "wss://akimikano.de/ws/room/"

    useEffect(() => {
		console.log("use effect")
		createPeer();
		createUserMedia();
		createWebsocket();
	});

	function createUserMedia() {
		navigator.mediaDevices.getUserMedia({video: true})
		.then(stream => {
			stream.getTracks().forEach(track => localPeerRef.current.addTrack(track, stream));
			userVideoRef.current.srcObject = stream;
		})
	};

	function createPeer() {
		localPeerRef.current = new RTCPeerConnection({iceServers: [{urls: "stun:stun.l.google.com:19302"}]})
		localPeerRef.current.onicecandidate = event => {
			console.log("onicecandidate")
			if (event.candidate) {
				sendIceCandidate(event.candidate);
			}
		};
		localPeerRef.current.ontrack = event => {
			console.log("ontrack");
		 	 partnerVideoRef.current.srcObject = event.streams[0];
		};
	};

	function sendOffer() {
		localPeerRef.current.createOffer()
		  .then(offer => localPeerRef.current.setLocalDescription(offer))
		  .then(() => {
			socketRef.current.send(JSON.stringify({"type": "offer", "data": localPeerRef.current.localDescription}));
		  })
		  .catch(error => console.error('Error creating offer.', error));

		// const offer = localPeerRef.current.createOffer();
		// localPeerRef.current.setLocalDescription(offer);
		// console.log(localPeerRef.current.localDescription)
		// socketRef.current.send(JSON.stringify({"type": "offer", "data": localPeerRef.current.localDescription}));
	};

	function sendAnswer(offer) {
		console.log(offer.sdp)
		localPeerRef.current.setRemoteDescription(new RTCSessionDescription(offer))
		.then(() => localPeerRef.current.createAnswer())
		.then(answer => localPeerRef.current.setLocalDescription(answer))
		.then(() => {
			socketRef.current.send(JSON.stringify({"type": "answer", "data": localPeerRef.current.localDescription}));
		})
		.catch(error => console.error('Error handling offer.', error));

		// localPeerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
		// const answer = localPeerRef.current.createAnswer();
		// localPeerRef.current.setLocalDescription(answer);
		// socketRef.current.send(JSON.stringify({"type": "answer", "data": localPeerRef.current.localDescription}));
	};

	function takeAnswer(answer) {
	  localPeerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
	};

	function sendIceCandidate(candidate) {
		socketRef.current.send(JSON.stringify({"type": "ice-candidate", "data": candidate}));
	};

	function takeIceCandidate(candidate) {
		const iceCandidate = new RTCIceCandidate(candidate);
		localPeerRef.current.addIceCandidate(iceCandidate);
	};

	function createWebsocket() {
		if (socketRef.current === undefined) {
			socketRef.current = new WebSocket(wsUrl + params.roomID);
			console.log("socket")
			socketRef.current.addEventListener("open", event => {
				socketRef.current.addEventListener("message", event => {
					const server_data = JSON.parse(event.data);

					console.log("Message from server ", server_data)

					if (server_data.type === "offer") {
						sendAnswer(server_data.data);
					}
					else if (server_data.type === "answer") {
						takeAnswer(server_data.data);
					}
					else if (server_data.type === "user-connection") {
						sendOffer();
					}
					else if (server_data.type === "ice-candidate") {
						takeIceCandidate(server_data.data);
					}
				});
			});
		}

	};

    return (
        <div>
            <video autoPlay ref={userVideoRef} />
            <video autoPlay ref={partnerVideoRef} />
        </div>
    );
}

export default Room;
