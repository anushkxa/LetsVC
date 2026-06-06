import { useNavigate } from "react-router-dom"
import withAuth from "../../utils/withAuth"
import { useState } from "react";
import { useContext } from "react";
import "../../App.css";
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from "../../contexts/AuthContext";
function LandComponent(){
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode]= useState("");

    const {addToUserHistory} = useContext(AuthContext);

    let handleJoinVideoCall= async()=>{
        await addToUserHistory(meetingCode); 
        navigate(`/${meetingCode}`)
    }
    return(
        <>
        <div className="navBar">
            <div style={{display:"flex", alignItems:"center"}}>
                <h2>Let's VC</h2>
            </div>
            <div style={{display:"flex", alignItems:"center"}}>
                <IconButton>
                    <RestoreIcon/>
                    <p>History</p>
                </IconButton>
                <Button onClick={()=>{
                    localStorage.removeItem("token");
                    navigate("/auth")
                }}>Logout</Button>
            </div>

        </div>
        <div className="meetContainer">
            <div className="leftPanel">

                <h2> Providing Quality Video Call </h2>
                <div style={{display:"flex", gap:"10px"}}>
                    <TextField onChange={e=>setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined"/>
                    <Button onClick={handleJoinVideoCall} variant='contained'> Join </Button>
                </div>

            </div>

            <div className="rightPanel">

                <img src='../../assets/land.svg'/>

            </div>

        </div>
        </>
    )
}

export default withAuth(LandComponent)