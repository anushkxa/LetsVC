import { useNavigate } from "react-router-dom"
import withAuth from "../../utils/withAuth"
import { useState } from "react";
import landMain from "../../assets/land.svg";
import { useContext } from "react";
import "../../App.css";
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from "../../contexts/AuthContext";
function LandComponent() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
//   const { addToUserHistory } = useContext(AuthContext);

  let handleJoinVideoCall = async () => {
    // await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  return (
    <>
      <div style={{ display:"flex", margin:"0 auto",alignItems:"center", justifyContent:"space-between", padding:"22px 40px", borderBottom:"0.5px solid #e5e5e5" }}>
        <h1 className="brand" style={{color: 'purple', fontSize:"1.4rem"}}>LetsVC</h1>
        <div style={{ display:"flex", alignItems:"center", gap:"20px" }}>
          <IconButton disableRipple size="small" style={{ color:"#888", fontSize:"20px", gap:"4px" }}>
            <RestoreIcon style={{ fontSize:"22px" }} />
            <span style={{ fontSize:"20px" }}>History</span>
          </IconButton>
          <Button disableRipple style={{ color:"#888", textTransform:"none", fontSize:"20px", minWidth:0, padding:0 }}
            onClick={() => { localStorage.removeItem("token"); navigate("/auth"); }}>
            Logout
          </Button>
        </div>
      </div>
      <div className="landContainer">
      <div className="leftPanel" style={{ padding:"96px 40px 0" }}>
        <h1>
          Quality video calls,<br />made simple.
        </h1>
        <p>
          Enter a meeting code to get started.
        </p>
        <div>
          <TextField
            size="small"
            placeholder="Enter meeting code"
            variant="outlined"
            onChange={e => setMeetingCode(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleJoinVideoCall()}
            inputProps={{ style:{ fontSize:"14px" } }}
          />
          <Button variant="contained" onClick={handleJoinVideoCall}
            style={{ background:"#7F77DD", textTransform:"none", boxShadow:"none", fontSize:"14px", borderRadius:"8px" }}>
            Join
          </Button>
        </div>
      </div>
      <div className="rightPanel">
        <img src={landMain} alt="Hero" />
      </div>
      </div>

      <footer style={{ backgroundColor: '#333', color: '#fff', padding: '20px', textAlign: 'center' }}>
      <p>&copy; {new Date().getFullYear()} Anushka Ltd. . All rights reserved.</p>
      <nav>
        <a href="/privacy" style={{ color: '#fff', marginRight: '10px' }}>Privacy Policy</a>
        <a href="/terms" style={{ color: '#fff' }}>Terms of Service</a>
      </nav>
    </footer>
    </>
  );
}

export default withAuth(LandComponent)