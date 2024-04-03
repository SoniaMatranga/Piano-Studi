'use strict'

function StudyPlanCourse(courseid, coursename, cfu, maxstudents, incompatible, preparatory, enrolled){
    this.courseid = courseid;
    this.coursename= coursename;
    this.cfu= cfu;
    this.maxstudents=maxstudents;
    this.incompatible=incompatible;
    this.preparatory=preparatory;
    this.enrolled=enrolled;
 
}

exports.StudyPlanCourse = StudyPlanCourse;