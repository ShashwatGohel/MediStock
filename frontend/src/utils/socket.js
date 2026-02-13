import { io } from "socket.io-client";

// In a real app, this should come from environment variables
const SOCKET_URL = "http://localhost:5005";

const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true
});

export default socket;
