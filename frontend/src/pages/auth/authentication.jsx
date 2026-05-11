import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const defaultTheme = createTheme();

export default function Authentication() {
    const [username, setUsername]=React.useState();
    const [password, setPassword]= React.useState();
    const [name, setName]= React.useState();
    const [error, setError] = React.useState();
    const [messages, setMessages]= React.useState();

    const [formState, setFormState]= React.useState(0);

    const [open,setOpen] = React.useState(false);

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f7fb',
        }}
      >
        {/* Card */}
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            width: '100%',
            maxWidth: 400,
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <LockOutlinedIcon />
            </Avatar>

            <div>
                <Button variant={formState===0?"contained":""} onClick={()=>{setFormState(0)}}>
                    Sign In
                </Button>
                <Button variant={formState===1?"contained":""} onClick={()=>{setFormState(1)}}>
                    Sign Up
                </Button>
            </div>

            <Box component="form" noValidate sx={{ mt: 2, width: '100%' }}>
              {formState==1?
              <TextField
                margin="normal"
                required
                fullWidth
                id='username'
                label="Full Name"
                name="username"
                autoFocus
                onChange={(e)=>setName(e.target.value)}
              />:<></>
              }

              <TextField
                margin="normal"
                required
                fullWidth
                id='username'
                label="Username"
                name="username"
                autoFocus
                onChange={(e)=>setUsername(e.target.value)}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                name="password"
                onChange={(e)=>setPassword(e.target.value)}
              
              />

              <FormControlLabel
                control={<Checkbox color="primary" />}
                label="Remember me"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2, mb: 1 }}
              >
                Sign In
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}