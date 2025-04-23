import React, { useEffect, useState } from "react";
import { socket } from "./socket";

function App() {
  const [peerId, setPeerId] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.emit("join", { gender: "male" }); // 範例 gender

    socket.on("matched", ({ peer }) => {
      setPeerId(peer);
    });

    socket.on("message", ({ from, message }) => {
      setChat(prev => [...prev, { from, message }]);
    });

    return () => socket.disconnect();
  }, []);

  const sendMessage = () => {
    socket.emit("message", { to: peerId, message });
    setChat(prev => [...prev, { from: "me", message }]);
    setMessage("");
  };

  return (
    <div>
      <h1>Chat Room</h1>
      {chat.map((c, i) => <div key={i}><b>{c.from}:</b> {c.message}</div>)}
      <input value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
