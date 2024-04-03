import { Container, Navbar, Button} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { PersonCircle, Mortarboard } from 'react-bootstrap-icons';
import { LogoutButton } from './LoginComponents';
import { useState } from 'react';

import { useNavigate } from 'react-router-dom';
function MyNavbar(props) {
  const [pressed, setPressed] = useState(false);
  const navigate = useNavigate();

  return (
    <Navbar variant="dark"  className='navbar justify-content-md-center' >
      <Container fluid>
        <Navbar.Brand><Mortarboard width="25" height="25" /></Navbar.Brand>
        <Navbar.Brand>Politecnico di Torino</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll" className="justify-content-center">
        </Navbar.Collapse>
        <Navbar.Brand>{props.loggedIn ? <PersonCircle width="25" height="25" fill="currentColor" /> : false}</Navbar.Brand>
        <Navbar.Brand> {props.loggedIn ? 
        <LogoutButton logout={props.logout} user={props.user} setPressed={setPressed} /> :
          pressed ? <Button variant='light' onClick={() => { setPressed(false); navigate('/'); }}>Home Page</Button>
          : <Button variant='light' onClick={() => { setPressed(true); navigate('/login'); }}>Login</Button>
       
         }
         </Navbar.Brand>
      </Container>
    </Navbar>
  );
}

export { MyNavbar };

