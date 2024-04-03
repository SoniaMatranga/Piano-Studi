import { Row, Col, Button, Table, Modal, SplitButton, Dropdown} from 'react-bootstrap';
import React from 'react';
import {  PencilSquare,  Trash, TrashFill } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {CourseCatalogue} from './HomePageComponent';


function HomePageloggedIn(props) {

    return (<>
        <Row >
            <Col>
                <StudyPlan studyPlan={props.studyPlan} user={props.user} loggedIn={props.loggedIn} checkIncompatibleStudyplan={props.checkIncompatibleStudyplan} 
                discard={props.discard} edit={props.edit} setEdit={props.setEdit} deleteCourse={props.deleteCourse} selectEnrollment={props.selectEnrollment}
                 addPermanently={props.addPermanently} deletePermanently={props.deletePermanently}  > </StudyPlan>
                <CourseCatalogue className="postion-relative" courses={props.courses} checkIncompatible={props.checkIncompatible} edit={props.edit} 
                loggedIn={props.loggedIn} user={props.user} addCourse={props.addCourse} checkCourse={props.checkCourse}></CourseCatalogue>
            </Col>
        </Row>
    </>)
}

function StudyPlan(props) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const navigate = useNavigate();


    return (

        <>
            <br />
            <h1 className="text-center" > Study Plan </h1>
            {props.user.enrollment !== null ?
                <Row>
                    <Col>
                        <h5 className="text-center"> Latest enrollment : {props.user.enrollment} </h5> </Col></Row> :
                <Row><Col>
                    <h5 className="text-center" > Create your study plan by first selecting the part-time or full-time option { }
                        <SplitButton
                            key="end"
                            id="dropdown-button-drop-end"
                            drop="end"
                            variant="success"
                            title="Select enrollment"
                        >
                            <Dropdown.Item eventKey="1" onClick={() => { props.selectEnrollment("full-time"); props.setEdit(true);  navigate('/edit') }} >full-time</Dropdown.Item>
                            <Dropdown.Item eventKey="2" onClick={() => { props.selectEnrollment("part-time"); props.setEdit(true); navigate('/edit') }}>part-time</Dropdown.Item>
                        </SplitButton> </h5>
                </Col>
                </Row>}
            {props.studyPlan.length === 0 ? false :
                <Row>
                    <Col xs={2}>
                        Credits TOTAL: {props.studyPlan ? props.studyPlan.map(c => c.cfu).reduce((c1, c2) => (c1 + c2)) : false}
                    </Col>

                    <Col xs={7}>
                        <span>&#40; min {props.user.enrollment === "full-time" ? 60 : 20}, max {props.user.enrollment === "full-time" ? 80 : 40} &#41;</span>
                    </Col>
                </Row>
            }

            <Table borderless hover size="sm" responsive="true" className='studyplan' >
                {props.studyPlan.length === 0 ? false :
                    <thead className="first-row" >
                        <tr>
                            <th>Course Code</th>
                            <th>Name</th>
                            <th>Credits</th>
                        </tr>
                    </thead>
                }

                <tbody>
                    {
                        props.studyPlan.map((course) => {

                            return (<StudyPlanRow course={course} key={course.courseid + course.userid} deleteCourse={props.deleteCourse} edit={props.edit}  >{ }</StudyPlanRow>)
                        })

                    }
                </tbody>


            </Table>
            {props.user.enrollment !== null ? props.edit ? props.studyPlan.length === 0 ? false :
                <Row >
                    <Col xs={10} style={{ display: 'flex', justifyContent: 'left' }}>
                        <Button variant='outline-success' onClick={() => { props.addPermanently(); props.setEdit(false); navigate('/loggedIn') }}>Save</Button>&nbsp;
                        <Button variant='outline-danger' onClick={() => { props.discard(); props.setEdit(false); navigate('/loggedIn') }}>Discard</Button>
                    </Col>

                    <Col>
                        <Button variant='danger' onClick={() => handleShow()}><TrashFill></TrashFill> Clear study plan</Button>
                    </Col>

                </Row> :
                <Button variant='success' onClick={() => { props.setEdit(true); props.checkIncompatibleStudyplan(); navigate('/edit') }}><PencilSquare></PencilSquare> Edit</Button>
                : false
            }
            <Modal
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Warning</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Do you want to clear your study plan permanently?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        No
                    </Button>
                    <Button variant="primary" onClick={() => { props.deletePermanently(); props.selectEnrollment(); props.setEdit(false);; navigate('/loggedIn'); handleClose() }}>Yes</Button>
                </Modal.Footer>
            </Modal>

        </>

    )
}

function StudyPlanRow(props) {
    return (
        <>
            <tr className='custom-row' >
                <StudyPlanCourseData course={props.course} deleteCourse={props.deleteCourse} edit={props.edit} />
            </tr>
        </>)

}


function StudyPlanCourseData(props) {

    return (
        < >
            <td >
                {props.course.courseid}
            </td>
            <td >
                {props.course.coursename}
            </td>
            <td>
                {props.course.cfu}
            </td>
            <td>
                <Button variant="light" hidden={!props.edit} onClick={() => { props.deleteCourse(props.course) }} > <Trash /> </Button>
            </td>

        </>
    );
}

export {  HomePageloggedIn };