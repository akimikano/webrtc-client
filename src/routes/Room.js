import React, { useRef, useEffect } from "react";
import {useParams} from "react-router-dom";


const Room = (props) => {
  	const params = useParams();
	const userStreamRef = useRef();
	const userVideoRef = useRef();
    const partnerVideoRef = useRef();
	const socketRef = useRef();
	const localPeerRef = useRef();
	const wsUrl = "ws://localhost:8000/ws/room/"
	const stunServers = [
			{
				urls: "stun:stun.l.google.com:19302"
			},
			{
				urls: "stun:stun.stunprotocol.org"
			},
			{
				urls: 'turn:numb.viagenie.ca',
				credential: 'muazkh',
				username: 'webrtc@live.com'
			}
	];

    useEffect(() => {
		console.log("use effect")

		navigator.mediaDevices.getUserMedia({video: true})
		.then(stream => {
			createPeer(stream);
			userVideoRef.current.srcObject = stream;
		})
		.then(() => {
			createWebsocket();
		})
	});

	function createPeer(stream) {
		let pc = new RTCPeerConnection(stunServers);

		pc.onicecandidate = event => {
			console.log("onicecandidate")
			if (event.candidate) {
				sendIceCandidate(event.candidate);
			}
		};

		pc.ontrack = event => {
			console.log("ontrack");
			partnerVideoRef.current.srcObject = event.streams[0];
		};

		stream.getTracks().forEach(track => pc.addTrack(track, stream));

		localPeerRef.current = pc;
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
		.then(() => {
			return localPeerRef.current.createAnswer();
		})
		.then((answer) => {
			return localPeerRef.current.setLocalDescription(answer);
		})
		.then((answer) => {
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
