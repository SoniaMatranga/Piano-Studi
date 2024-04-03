import { Form, Button, Alert, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { useState } from 'react';

function LoginForm(props) {
  const [username, setUsername] = useState('student@studenti.polito');
  const [password, setPassword] = useState('password');
  const [errorMessage, setErrorMessage] = useState('');


  const [validated, setValidated] = useState(false);


  const handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setErrorMessage('');
    props.setMessage('')

    const credentials = { username, password };

    const form = event.currentTarget;

    if (!form.checkValidity()) {
      setValidated(true);
    }
    else if (username === '' || password === '') {
     setErrorMessage("Email and password cannot be empty ");
      setValidated(false);
    }
    else {
      props.login(credentials);
    }
  };


  return (
    <>
      <br />
      <Container responsive="true">
        <br />
        <Row className="justify-content-md-center " >
          <Col className="login" xs={7}>
            <br />
            <h2 className="text-center">Login</h2>
            {errorMessage ? <Alert variant='danger' onClose={() => setErrorMessage('')} dismissible>{errorMessage}</Alert> : false}
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Row>
                <Form.Group controlId='username'>
                  <Form.Label></Form.Label>
                  <InputGroup>
                    <InputGroup.Text id="inputGroupPrepend">@ Email</InputGroup.Text>

                    <Form.Control
                      type='email'
                      hasvalidation={"true"}
                      value={username}
                      onChange={ev => setUsername(ev.target.value)}
                      required />
                      <Form.Control.Feedback type="invalid">
                    Please choose a valid email
                  </Form.Control.Feedback>
                  </InputGroup>
                  

                </Form.Group>
              </Row>
              <Row>
                <Form.Group controlId='password'>
                  <Form.Label></Form.Label>
                  <InputGroup>
                    <InputGroup.Text id="inputGroupPrepend">Password</InputGroup.Text>
                    <Form.Control
                      type='password'
                      hasvalidation={"true"}
                      value={password}
                      onChange={ev => setPassword(ev.target.value)}
                      required />
                       <Form.Control.Feedback type="invalid">
                    Please insert password
                  </Form.Control.Feedback>

                  </InputGroup>
                  
                </Form.Group>
              </Row>
              <br />
              <Button type="submit">Login</Button>
            </Form>
            <br />
          </Col>
        </Row>

      </Container>
      <br />
    </>
  )
}

function LogoutButton(props) {
  return (
    <Col>
      <span> Welcome, {props.user?.name}</span>{' '}<Button variant='light' onClick={() => {props.setPressed(false); props.logout(); }}>Logout</Button>
    </Col>
  )
}

export { LoginForm, LogoutButton };