import { useEffect, useRef, useState } from "react";
import "../../styles/meeting.css";

export default function MeetingComponent() {
  const localVideoRef = useRef(null);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
        if (cancelled) return;

        const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) return;

        const useVideo = !!videoPermission;
        const useAudio = !!audioPermission;
        if (!useVideo && !useAudio) return;

        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: useVideo,
          audio: useAudio,
        });
        if (cancelled || !userMediaStream) return;
        window.localStream = userMediaStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = userMediaStream;
        }
      } catch (err) {
        console.log(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2> Enter into Lobby</h2>
          <label htmlFor="username-input">Username</label>
          <input
            id="username-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="button" onClick={() => setAskForUsername(false)}>
            Connect
          </button>

          <div>
            <video ref={localVideoRef} autoPlay muted />
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
