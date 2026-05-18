import { useEffect, useRef, useState } from "react";
import "../../styles/meeting.css";
import { io, Socket } from "socket.io-client";
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
  let[showModal,setModal]=useState();
  let[screenAvailable,setScreenAvailable]=useState();
  let[messages,setMessages]=useState([]);
  let[message,setMessage]=useState("");
  let[newMessages,setNewMessages]=useState(0);
  let[askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  const videoRef = useRef([]);
  let[videos,setVideos]=useState([]);


 const getPermissions=async () =>{
  try{
        const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
        if(videoPermission){
          setVideoAvailable(true);
        }else{ setVideoAvailable(false);}

        const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
        if(audioPermission){
          setAudioAvailable(true);
        }else{ setAudioAvailable(false);}

        if(navigator.mediaDevices.getDisplayMedia){
          setScreenAvailable(true);
        }else{
          setScreenAvailable(false);
        }

        if(videoAvailable || audioAvailable){
          const userMediaStream= await navigator.mediaDevices.getUserMedia({video:videoAvailable, audio:audioAvailable});
          if(userMediaStream){
            window.localStream=userMediaStream;
            if(localVideoRef.current){
              localVideoRef.current.srcObject=userMediaStream;
            }
          }
        }
      }
  catch(err){
    console.log(err);
  }
 }

  useEffect(()=>{
    getPermissions();
  },[])

  let getUserMediaSuccess=(stream)=>{

  }

  let getUserMedia=()=>{
    if((video||videoAvailable) && (audio||audioAvailable)){
      navigator.mediaDevices.getUserMedia({video:video,audio:audio})
      .then(getUserMediaSuccess)
      .then((stream)=>{})
      .catch((e)=>console.log(e));
  }else{
    try{
      let tracks=localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track=>track.stop());
    }catch(e){}
  }
  }

 useEffect(()=>{
  if(video!==undefined && audio !== undefined){
    getUserMedia();
  }
 },[audio,video]);


 let gotMessageFromServer=(fromId,message)=>{
  var signal = JSON.parse(message)
  if(fromId !== socketIdRef.current){
    if(signal.sdp){
      connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(()=>{
        if(signal.sdp.type==="offer"){
          connections[fromId].createAnswer().then((description)=>{
            connectToSocketServer[fromId].setLocalDescription(description).then(()=>{
              socketIdRef.current.emit("signal",fromId, JSON.stringify({"sdp":connections[fromId].localDescription}))
            })
          })
        }
      })
    }
  }
 }

 let connectToSocketServer=()=>{
  socketRef.current= io.connect(server_url,{secure:false});
  socketRef.current.on('signal',gotMessageFromServer);
  socketRef.current.on("connect",()=>{
    socketRef.current.emit("join-call",window.location.href);
    socketIdRef.current=socketRef.current.id;
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
        connections[SocketListId].onaddstream=(event)=>{
          let videoExists=videoRef.current.find(video => video.socketId===SocketListId);
          if(videoExists){
            setVideo(videos=>{
              const updateVideos= videos.map(video=>
                video.socketId === SocketListId ?{...video, stream: event.stream}:video
              );
              videoRef.current=updateVideos;
              return updateVideos;
            })
          }else{
            let newVideo={
              socketId: SocketListId,
              stream: event.stream,
              autoPlay:true,
              playsInline:true
            }
            setVideos(videos=>{
              const updatedVideos = [...videos, newVideo];
              videoRef.current=updatedVideos;
              return updatedVideos;
            });
          }
        };

        if(window.localStream !== undefined && window.localStream !==null){
          connections[SocketListId].addStream(window.localStream);
        }else{
        }
      })

      if(id=== socketIdRef.current){
        for(let id2 in connections){
          if(id2 === socketIdRef.current) continue
          try{
            connections[id2].addStream(window.localStream)
          }catch(e){
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
        <></>
      )}
    </div>
  );
}
