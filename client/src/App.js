
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './Components.css'
import React from 'react';
import { Container, Row, Col, Alert} from 'react-bootstrap';
import { CourseCatalogue} from './HomePageComponent';
import { HomePageloggedIn } from './HomeLoggedInComponent';
import { MyNavbar } from './NavbarComponents';
import { useNavigate, BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from './API';
import { LoginForm } from './LoginComponents';


function App() {
  return (
    <Router>
      <App2 />
    </Router>
  )
}

function App2() {
  const [courses, setCourses] = useState([]);
  const [studyPlan, setStudyPlan] = useState([]);
  const [oldStudyPlan, setOldStudyPlan] = useState([]);
  const [edit, setEdit] = useState(false);
  const [dirty, setDirty] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);  // no user is logged in when app loads
  const [user, setUser] = useState({});
  const [latestEnrollment, setLatestEnrollment] = useState();
  const [updateUser, setUpdateUser] = useState(false);
  const [message, setMessage] = useState('');
  const [successmess, setSuccessMess] = useState('');
  const navigate = useNavigate();


  //======================================  USE EFFECT ===========================================
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
        setLatestEnrollment(user.enrollment);
        setEdit(false);
      } catch (err) {

      }
    };
    checkAuth();
  }, [updateUser]);


  useEffect(() => {
    API.getCourses()
      .then((courses) => { setCourses(courses);})
      .catch(err => handleError(err))
  }, [dirty]);

  useEffect(() => {
    if (loggedIn)
      API.getStudyPlan()
        .then((courses) => { setStudyPlan(courses); setOldStudyPlan(courses); setDirty(false) })
        .catch(err => handleError(err))
  }, [loggedIn, dirty]);


  function handleError(err) {
    setMessage(err);
  }



  //======================================== LOGIN AND LOGOUT ============================================

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then(user => {
        setLoggedIn(true);
        setUser(user);
        setLatestEnrollment(user.enrollment);
        setMessage('');
        navigate('/loggedIn');

      })
      .catch(err => {
        setMessage(err);
      }
      )
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser({});
    setLatestEnrollment({});
    setStudyPlan([]);
    setOldStudyPlan([]);
    setDirty(!dirty)
    setSuccessMess('');
    setMessage('');
    setEdit(false);
    navigate('/');


  }

  // ============================================ CHECK FUNCTIONS ===============================================

  //checks if the course is already in the studyplan, used to disable add buttons
  function checkCourse(course) {
    return (studyPlan.find(c => c.courseid === course.courseid) === undefined);
  }

  //checks max and min cfu constraints before add
  function checkCfu(course) {
    let CfuTotal = 0;
    if (studyPlan.length !== 0)
      CfuTotal = studyPlan.map(c => c.cfu).reduce((c1, c2) => (c1 + c2));
    if (course) CfuTotal += course.cfu;
    let max = (user.enrollment === "full-time") ? 80 : 40;
    let min = (user.enrollment === "full-time") ? 60 : 20;

    if (CfuTotal > max) {
      setMessage("If you add this course you will exceed the maximum number of credits");
      return (1);
    }
    else if (CfuTotal < min) {
      return (0);
    }

    else return (-1);
  }

  //Check if a course with preparatory constaint can be added
  function checkPreparatory(course) {
    if (course.preparatory && studyPlan.find(c => c.courseid === course.preparatory) === undefined) { 
      return (false); 
    } else return true ; 
  }

  //Check if a course with preparatory constaint can be deleted 
  function checkPreparatoryOnDelete(course) {
    return (studyPlan.find(c => c.preparatory === course.courseid) === undefined)
  }

  //check if a course is incompatible before add
  function checkIncompatible(course) {
    let incompatible = course.incompatible.split(","); //vect incompatible courses
    let found = false;
    if (incompatible) {
      incompatible.forEach(
        i => {
          if (studyPlan.find(c => c.courseid === i) !== undefined) {
            found = true;  //course cannot be added
          }
        })

    }
    return (found);
  }

  //check max students constraint before add
  function checkMaxStudents(course) {
    if (course.maxstudents) {
      return (course.enrolled < course.maxstudents);
    } else return (true);
  }

  //shows incompatible and inserted courses on edit
  function checkIncompatibleStudyplan() {
  
    studyPlan.forEach(course =>{
      let incompatible = course.incompatible.split(",");
      incompatible.forEach(i=>
      setCourses(courses =>
        courses.map(c => c.id === i ? { ...c, status: 'incompatible' } : c)
        .map(c => c.id === course.courseid ? { ...c, status: 'inserted' } : c)
        ))
       } )

    courses.forEach(course =>{
      if(!checkPreparatory(course)){
        setCourses(courses=> courses.map(c=> c.id === course.id ?  { ...c, status: 'incompatible' } : c));
      }}) 
  }

  //=================================== ADD AND DELETE LOCAL ============================================

  function addCourse(course) {
    if (user.enrollment && checkCourse(course) && checkCfu(course) < 1 && checkPreparatory(course) && !checkIncompatible(course) && checkMaxStudents(course)) {
      setStudyPlan(oldPlan => [...oldPlan, course]);
      let incompatible = course.incompatible.split(",");
      incompatible.forEach(i =>
        setCourses(courses => courses.map(c =>
          (c.id === course.courseid) ? {
            id: course.courseid,
            name: course.coursename,
            cfu: course.cfu,
            preparatory: course.preparatory,
            incompatible: course.incompatible,
            maxstudents: course.maxstudents,
            enrolled: course.enrolled + 1
          } : c).map(c => c.id === i ? { ...c, status: 'incompatible' } : c)
          .map(c => c.id === course.courseid ? { ...c, status: 'inserted' } : c)
        ));
          setCourses(courses=> courses.map(c=> c.preparatory === course.courseid ?  { ...c, status: 'base' } : c));
        
    }
    if (!checkPreparatory(course)) {
      setMessage(`The course "${course.coursename}"  has a prerequisite constraint. 
      If you want to add this course, you have to insert "${courses.find(c => c.id===course.preparatory).name}" before.`);
    }
    else if (checkIncompatible(course)) {
      setMessage(`The course "${course.coursename}" is incompatible with other courses so it cannot be added to your studyplan.
      See course details to check incompatibilities."`);
    }
    else if (!checkMaxStudents(course)) {
      setMessage("This course has already reached the maximum number of enrolled students.")
    }
  }

  function deleteCourse(course) {

    if (checkPreparatoryOnDelete(course)) {
      setStudyPlan(studyPlan.filter((c) => c.courseid !== course.courseid))
      let incompatible = courses.find(c => c.id === course.courseid).incompatible.split(",");
      incompatible.forEach(i =>
        setCourses(courses => courses.map(c => (c.id === course.courseid) ? {
          id: c.id,
          name: c.name,
          cfu: c.cfu,
          preparatory: c.preparatory,
          incompatible: c.incompatible,
          maxstudents: c.maxstudents,
          enrolled: c.enrolled - 1,
        } : c).map(c => c.id === i ? { ...c, status: 'base' } : c)))

        setCourses(courses=> courses.map(c=> c.preparatory === course.courseid ?  { ...c, status: 'incompatible' } : c));
    }

    else { setMessage(`The course "${course.coursename}" is a preparatory course. If you want to remove it
    you have to delete "${studyPlan.find(c => c.preparatory===course.courseid).coursename}" first.`) };
  }

  // =============================== SAVE, DISCARD, CANCEL ===========================================

  const addPermanently = async () => {
    if (checkCfu() < 0) {
      await API.deleteAll()
        .then(API.updateEnrolledNumber(oldStudyPlan, -1))
        .then(() => API.updateEnrollment(user.enrollment))
        .then(() => API.updateEnrolledNumber(studyPlan, +1))
        .then(() => API.addAll(studyPlan))
        .then(() => {
          setDirty(!dirty);
          setOldStudyPlan(studyPlan);
          setLatestEnrollment(user.enrollment);
          setSuccessMess('Study plan correctly saved');
          navigate('/loggedIn')
        }).catch(()=> handleError("Error on save"));
    }
    else {
      await API.updateEnrollment(latestEnrollment)
      .then( setUser(() => API.getUserInfo()))
      .catch(()=> handleError(''));
      discard();
      setMessage("Study plan not saved");
    }

  }


  function discard() {
    setUpdateUser(!updateUser)
    setDirty(true);
  }

  const selectEnrollment = async (enrollment) => {
    user.enrollment = (enrollment);
    setDirty(!dirty);
    
  }


  const deletePermanently = async () => {
    await API.updateEnrolledNumber(oldStudyPlan, -1)
    .then(await API.deleteAll())
    .then(await API.updateEnrollment())
      .then(setUpdateUser(!updateUser))
      .catch(() =>
        handleError("Study plan not deleted"));
      setDirty(!dirty);
      navigate('/loggedIn');
      
  }


  return (
    <>
      <MyNavbar loggedIn={loggedIn} user={user} style={{position:"fixed"}} logout={doLogOut}></MyNavbar>
      <Container fluid="md" className="mh-100">
        <br />
        <Row>
          <Col>
            {message ? <Alert variant='danger' onClose={() => setMessage('')} dismissible>{message}</Alert> : false}
          </Col>
        </Row>
        {loggedIn ?
          <Row><Col>
            {successmess ? <Alert variant='success' onClose={() => setSuccessMess('')} dismissible>{successmess}</Alert> : false}
          </Col></Row>
          : false}


        <Routes>
          <Route path='/' element={<CourseCatalogue className="postion-relative" courses={courses} loggedIn={loggedIn} user={user} />} />
          <Route path='/loggedIn' element={loggedIn ?
            <HomePageloggedIn className="postion-relative" courses={courses} studyPlan={studyPlan}
              loggedIn={loggedIn} discard={discard} selectEnrollment={selectEnrollment} checkIncompatibleStudyplan={checkIncompatibleStudyplan} checkIncompatible={checkIncompatible} user={user} edit={edit} setEdit={setEdit} /> : <Navigate to='/login' />}>
          </Route>
          <Route path='/edit' element={loggedIn ? <HomePageloggedIn className="postion-relative" courses={courses} studyPlan={studyPlan}
            loggedIn={loggedIn} discard={discard} selectEnrollment={selectEnrollment} addCourse={addCourse} deleteCourse={deleteCourse}
            addPermanently={addPermanently} deletePermanently={deletePermanently} checkCourse={checkCourse} checkIncompatibleStudyplan={checkIncompatibleStudyplan}
            checkIncompatible={checkIncompatible} checkPreparatory={checkPreparatory} user={user} edit={edit} setEdit={setEdit} /> : <Navigate to='/login' />}>
          </Route>
          <Route path='/login' element={loggedIn ? <Navigate to='/loggedIn' /> : <LoginForm login={doLogIn} setMessage={setMessage} />} />
          <Route path='*' element={<h1 className="text-center">Page not found</h1>}> </Route>
        </Routes>

      </Container>
    </>
  );
}


export default App;
