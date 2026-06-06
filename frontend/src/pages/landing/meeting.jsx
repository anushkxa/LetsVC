import { useEffect, useRef, useState } from "react";
import {useNavigate} from "react-router-dom";
import styles from "../../styles/meeting.module.css";
import { io, Socket } from "socket.io-client";
import {IconButton, Badge, Button} from "@mui/material";
import TextField from "@mui/material/TextField";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from  "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import ChatIcon from "@mui/icons-material/Chat";

const server_url="http://localhost:8000";

var connections={};
const peerConfiguration={
  "iceServers":[
    {"urls":"stun:stun.l.google.com:19302"}
  ]
}

export default function MeetingComponent() {
  var socketRef = useRef();
  let socketIdRef=useRef();
  let localVideoRef=useRef();
  let[videoAvailable,setVideoAvailable]=useState(true);
  let[audioAvailable,setAudioAvailable]=useState(true);
  let [video,setVideo]=useState(false);
  let [audio,setAudio]=useState(false);
  let[screen,setScreen]=useState();
  let[showModal,setModal]=useState(true);
  let[screenAvailable,setScreenAvailable]=useState();
  let[messages,setMessages]=useState([]);
  let[message,setMessage]=useState("");
  let[newMessages,setNewMessages]=useState(0);
  let[askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  const videoRef = useRef([]);
  let[videos,setVideos]=useState([]);


const getPermissions = async () => {
  try {
    const userMediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setVideoAvailable(true);
    setAudioAvailable(true);
    setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

    window.localStream = userMediaStream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = userMediaStream;
    }
  } catch (err) {
    console.log(err);
    setVideoAvailable(false);
    setAudioAvailable(false);
  }
};

  useEffect(()=>{
    getPermissions();
  },[])

  let getUserMediaSuccess=(stream)=>{
    try{
      window.localStream.getTracks().forEach(track=>track.stop())
    }catch(e) {console.log(e)}

    window.localStream=stream;
    localVideoRef.current.srcObject=stream;
    for(let id in connections){
  if(id===socketIdRef.current) continue;

  const senders = connections[id].getSenders();

  stream.getTracks().forEach(track => {
    const sender = senders.find(
      s => s.track && s.track.kind === track.kind
    );

    if(sender){
      sender.replaceTrack(track);
    }else{
      connections[id].addTrack(track, stream);
    }
  });

  connections[id].createOffer().then((description)=>{
    connections[id].setLocalDescription(description)
    .then(()=>{
      socketRef.current.emit(
        "signal",
        id,
        JSON.stringify({ sdp: connections[id].localDescription })
      );
    })
    .catch(e=>console.log(e));
  });
}

    stream.getTracks().forEach(track=>track.onended=()=>{
      setVideo(false)
      setAudio(false);
      try{
        let tracks= localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track=>track.stop())
      } catch(e) {console.log(e)}

      let blackSilence =(...args)=> new MediaStream([black(...args),silence()])
      window.localStream=blackSilence();
      localVideoRef.current.srcObject= window.localStream;

      for(let id in connections){
        connections[id].createOffer().then((description)=>{
          connections[id].setLocalDescription(description)
          .then(()=>{
            socketRef.current.emit("signal",id,JSON.stringify({"sdp":connections[id].localDescription}))
          }).catch(e=>console.log(e))
        })
      }
    })

  }

  let silence=()=>{
    let ctx= new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect((ctx.createMediaStreamDestination()));

    oscillator.start();
    ctx.resume()
    return Object.assign(dst.stream.getAudioTracks()[0],{enabled:false})
  }

  let black = ({ width = 640, height = 480 } = {}) => {
  let canvas = Object.assign(document.createElement("canvas"), {
    width,
    height,
  });
  canvas.getContext("2d").fillRect(0, 0, width, height);
  let stream = canvas.captureStream();
  let track = stream.getVideoTracks()[0];
  track.enabled = false;
  return track;
};

  let getUserMedia = () => {
  if (videoAvailable || audioAvailable) {
    navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable })
      .then(getUserMediaSuccess)
      .catch((e) => console.log(e));
  } else {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    } catch(e) {}
  }
  }

  useEffect(() => {
    if (video !== undefined && audio !== undefined && (video || audio)) {
      getUserMedia();
    }
  }, [audio, video]);


 let gotMessageFromServer=(fromId,message)=>{
  var signal = JSON.parse(message)
  if(fromId !== socketIdRef.current){
    if(signal.sdp){
      connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(()=>{
        if(signal.sdp.type==="offer"){
          connections[fromId].createAnswer().then((description)=>{
            connections[fromId].setLocalDescription(description).then(()=>{
              socketRef.current.emit("signal",fromId, JSON.stringify({"sdp":connections[fromId].localDescription}))
            }).catch(e=>console.log(e))
          }).catch(e=>console.log(e))
        }
      }).catch(e=>console.log(e))
    }
    if(signal.ice){
      connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e=>console.log(e))
    }
  }
 }

 let addMessage = (data, sender, socketIdSender) => {
  setMessages((prevMessages) => [...prevMessages, { sender:sender, data:data }]);
  if (socketIdSender !== socketIdRef.current) {
    setNewMessages((prevMessages) => prevMessages + 1);
  }
}

 let connectToSocketServer=()=>{
  socketRef.current= io.connect(server_url,{secure:false});
  socketRef.current.on('signal',gotMessageFromServer);
  socketRef.current.on("connect",()=>{
    socketRef.current.emit("join-call",window.location.href, username);
    socketIdRef.current=socketRef.current.id;
    socketRef.current.off("chat-message");
    socketRef.current.on("chat-message",addMessage);
    socketRef.current.on("user-left",(id)=>{
      setVideos((videos) =>
        videos.filter((video) => video.socketId !== id)
      );
    })
    socketRef.current.on("user-joined",(id,clients)=>{
      clients.forEach((SocketListId)=>{
        connections[SocketListId]= new RTCPeerConnection(peerConfiguration);
        connections[SocketListId].onicecandidate=(event)=>{
          if(event.candidate != null){
            socketRef.current.emit("signal",SocketListId,JSON.stringify({"ice":event.candidate}));
          }
        }
        connections[SocketListId].ontrack = (event) => {
          if (event.track.kind !== "video") return;
          let stream = event.streams[0];
          let videoExists = videoRef.current.find(
            (video) => video.socketId === SocketListId
          );
          if (videoExists) {
            setVideos((videos) => {
              const updateVideos = videos.map((video) =>
                video.socketId === SocketListId
              ? { ...video, stream }
              : video
            );
            videoRef.current = updateVideos;
            return updateVideos;
            });
            } else {
              let newVideo = {
                socketId: SocketListId,
              stream,
              autoPlay: true,
              playsInline: true
            };

    setVideos((videos) => {

      const updatedVideos = [...videos, newVideo];

      videoRef.current = updatedVideos;

      return updatedVideos;
    });
  }
};

        if (window.localStream === undefined || window.localStream === null) {
  let blackSilence = (...args) =>
    new MediaStream([black(...args), silence()]);

  window.localStream = blackSilence();
}
      })

      if(id=== socketIdRef.current){
        for(let id2 in connections){
          if(id2 === socketIdRef.current) continue
          try{
            window.localStream.getTracks().forEach((track) => {
            connections[id2].addTrack(
            track,
              window.localStream
            );
          });
          }catch(e){
            console.log(e)
          }
          connections[id2].createOffer().then((description)=>{
            connections[id2].setLocalDescription(description)
            .then(()=>{
              socketRef.current.emit("signal",id2,JSON.stringify({"sdp":connections[id2].localDescription}))
            })

            .catch(e=>console.log(e))
          })
        }
      }
  })
 })
}

  let getMedia=()=>{
    setVideo(videoAvailable);
    setAudio(audioAvailable);

    connectToSocketServer();
  }

  let connect=()=>{
    setAskForUsername(false);
    getMedia();
  }
  let routeTo= useNavigate();

 let handleVideo = () => {
  const newVideoState = !video;
  setVideo(newVideoState);

  if (window.localStream) {
    window.localStream.getVideoTracks().forEach(track => {
      track.enabled = newVideoState;
    });
  }
};

  let handleAudio = () => {
  const newAudioState = !audio;
  setAudio(newAudioState);

  if (window.localStream) {
    window.localStream.getAudioTracks().forEach(track => {
      track.enabled = newAudioState;
    });
  }
};
  let getDisplayMediaSuccess=(stream)=>{
    try{
      window.localStream.getTracks().forEach(track=>track.stop())
    }catch(e){console.log(e)}

    window.localStream=stream;
    localVideoRef.current.srcObject=stream;
    for(let id in connections){
      if(id=== socketIdRef.current)continue;
      connections[id].addStream(window.localStream)
      connections[id].createOffer().then((description)=>{
        connections[id].setLocalDescription(description)
        .then(()=>{
          socketRef.current.emit("signal",id,JSON.stringify({"sdp":connections[id].localDescription}))
        })
        .catch(e=>console.log(e));
      })
    }

    stream.getTracks().forEach(track=>track.onended=()=>{
      setScreen(false);
      try{
        let tracks= localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track=>track.stop())
      } catch(e) {console.log(e)}

      let blackSilence =(...args)=> new MediaStream([black(...args),silence()])
      window.localStream=blackSilence();
      localVideoRef.current.srcObject= window.localStream;

      getUserMedia();
    })
  }
  let getDisplayMedia=()=>{
    if(navigator.mediaDevices.getDisplayMedia){
      navigator.mediaDevices.getDisplayMedia({video:true, audio:true})
      .then(getDisplayMediaSuccess)
      .then((stream)=>{})
      .catch((e)=>console.log(e));
    }
  }
  useEffect(()=>{
    if(screen !== undefined){
      getDisplayMedia();
    }
  },[screen])
  let handleScreen=()=>{
    setScreen(!screen)
  }

  let sendMessage=()=>{
    socketRef.current.emit("chat-message",message,username);
    setMessage("");
  }

  let handleEndCall = () => {
    try {
        let tracks = localVideoRef.current.srcObject?.getTracks() || [];
        tracks.forEach(track => track.stop());
    } catch (e) {
        console.log(e);
    }

    routeTo("/home");
    }


  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2> Enter into Lobby</h2>
          <input
            id="username-input"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="button"  variant="contained" onClick={connect}>
            Connect
          </button>

          <div>
            <video ref={localVideoRef} autoPlay muted playsInline/>
          </div>
        </div>
      ) : (
        <div className={styles.meetContainer}>
        {showModal?<div className={styles.chatRoom}>
            <div className={styles.chatContainer}>
              <h1>Messages</h1>

              <div className={styles.chattingDisplay}>

                {messages.length>0 ? messages.map((item, index)=>{
                  return(
                    <div style={{marginBottom:"20px"}} key={index}>
                      <p style={{fontWeight:"bold"}}>{item.sender}</p>
                      <p>{item.data}</p>
                    </div>
                  )
                }):<></>}

              </div>
              <div className={styles.chattingArea}>
                <TextField value={message} onChange={(e)=>setMessage(e.target.value)} label="Chat" variant="outlined" sx={{ flex: 1,"& .MuiInputBase-input": {color: "white",
                },
                "& .MuiInputLabel-root": {
                color: "white",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "white",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "white",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "white",
    },
  }}
/><Button onClick={sendMessage}>Send</Button>
              </div>

            </div>
          </div>:<></>}

          <div className={styles.buttonContainer}>
            <IconButton onClick={handleVideo} style={{color:"white"}}>
              {(video==true)? <VideocamIcon/> : <VideocamOffIcon/>}
            </IconButton>
            <IconButton onClick={handleEndCall} style={{color:"red"}}>
              <CallEndIcon/>
            </IconButton>
            <IconButton onClick={handleAudio} style={{color:"white"}}>
              {(audio==true)? <MicIcon/> : <MicOffIcon/>}
            </IconButton>
            {(screenAvailable===true)?
            <IconButton onClick={handleScreen} style={{color:"white"}}>
              {(screen==true)? <ScreenShareIcon/> : <StopScreenShareIcon/>}
            </IconButton>: <></> }

            <Badge badgeContent={newMessages} max={999} color='secondary' >
              <IconButton onClick={()=>setModal(!showModal)} style={{color:"white"}}>
              <ChatIcon/>
              </IconButton>
            </Badge>


          </div>

          <video className={styles.userVideo} ref= {localVideoRef} autoPlay muted></video>
          <div className={styles.confView}>
            {videos.map((video) => (
              <div key={video.socketId}>
              <video className={styles.usersVideo}
              data-socket={video.socketId}
              ref={ref=>{
                if(ref && video.stream){
                  ref.srcObject=video.stream;
                }
              }}
              autoPlay
              playsInline
            />
          </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
