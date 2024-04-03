import { Row, Col, Button, Table, Collapse, Card} from 'react-bootstrap';
import React from 'react';
import { CaretDown, CaretUp, SquareFill} from 'react-bootstrap-icons';
import { useState } from 'react';



function CourseCatalogue(props) {
    return (
        <>
            <Row >
                <Col>
                    <CoursesTable courses={props.courses} loggedIn={props.loggedIn} user={props.user}
                        addCourse={props.addCourse} checkCourse={props.checkCourse} edit={props.edit}
                        checkIncompatible={props.checkIncompatible} />
                </Col>
            </Row>
        </>
    );
}

function CoursesTable(props) {
    return (
        <>
            <br />
            <h1 className="text-center" > Course catalogue</h1>
            <h5 className="text-center">  Ingegneria Informatica (Computer Engineering), Class LM-32 </h5>
            <h5 className="text-center">Program duration: 2 years</h5>
            
            {props.edit ?
                <Card style={{ width: '25rem' }}>
                    <Card.Body>
                        <Card.Text>
                            
                        <SquareFill fill="#FFF9C4"></SquareFill> courses already in your study plan
                        </Card.Text>
                        <Card.Text>
                        
                     <SquareFill fill="#FFCDD2"></SquareFill> courses incompatible with your study plan
                     

                        </Card.Text>
                    </Card.Body>
                    
                </Card>: false}
                
            
            <Table borderless hover size="sm" responsive="true" className='table' >
                <thead className="first-row" >
                    <tr>
                        <th>Course Code</th>
                        <th>Name</th>
                        <th>Credits</th>
                        <th>Enrolled students</th>
                        <th>Max students</th>
                        <th>Details</th>
                    </tr>
                </thead>

                <tbody>
                    {
                        props.courses.map((course) => <CoursesRow course={course} key={course.id} loggedIn={props.loggedIn}
                            user={props.user} addCourse={props.addCourse} checkCourse={props.checkCourse} edit={props.edit}
                            checkIncompatible={props.checkIncompatible} />)
                    }
                </tbody>
            </Table>

        </>
    )
}

function CoursesRow(props) {

    const [open, setOpen] = useState(false);
    let statusClass = "custom-row";


    switch (props.course.status) {
        case 'base':
            statusClass = 'custom-row';
            break;

        case 'inserted':
            statusClass = 'table-warning';
            break;

        case 'incompatible':
            statusClass = 'table-danger';
            break;

        default:
            break;
    }

    function getPreparatory() {
        return (
            <>
                <td id="collapse-text">Perparatory course:</td><td id="collapse-text">{props.course.preparatory}</td>
            </>
        )

    }

    return (
        <>
            <tr className={statusClass}>
                <CourseData course={props.course} setOpen={setOpen} open={open} checkIncompatible={props.checkIncompatible} loggedIn={props.loggedIn} user={props.user} edit={props.edit} checkCourse={props.checkCourse} addCourse={props.addCourse} />
            </tr>
           {props.course.incompatible?
            <Collapse in={open}>

                <tr key={props.course.id + props.course.incompatible} >

                    <td id="collapse-text">Incompatible courses: </td>
                    <td id="collapse-text">{props.course.incompatible}</td>
                </tr>

            </Collapse> : false}
            <Collapse in={open}>
                <tr key={props.course.id + props.course.preparatory} >

                    {(props.course.preparatory) ? getPreparatory() : false}
                </tr>
            </Collapse>


        </>)

}


function CourseData(props) {

    return (
        < >
            <td >
                {props.course.id}
            </td>
            <td >
                {props.course.name}
            </td>
            <td>
                {props.course.cfu}
            </td>
            <td>
                {props.course.enrolled}
            </td>
            <td>
                {props.course.maxstudents}
            </td>
            <td>
                {props.course.incompatible || props.course.preparatory ? <Button variant='light' onClick={() => props.setOpen(!props.open)}
                aria-controls="collapse-text"
                aria-expanded={props.open} >{(props.open) ? <CaretUp></CaretUp> : <CaretDown></CaretDown>}</Button> : false}</td>

            <td>
                {props.loggedIn && props.edit ?
                    (!props.checkCourse({ courseid: props.course.id }) ?
                        <Button variant='secondary' disabled> + </Button> :
                        <Button variant='success' onClick={() => {
                            props.addCourse({
                                courseid: props.course.id,
                                coursename: props.course.name, cfu: props.course.cfu, preparatory: props.course.preparatory, incompatible: props.course.incompatible,
                                maxstudents: props.course.maxstudents, enrolled: props.course.enrolled
                            })
                        }} > + </Button>
                    )
                    : false}</td>


        </>
    );
}




export { CourseCatalogue};