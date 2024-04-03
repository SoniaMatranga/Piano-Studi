'use strict'

function Course(id, name, cfu, maxstudents, incompatible, preparatory, enrolled){
    this.id = id;
    this.name = name;
    this.cfu=cfu;
    this.maxstudents=maxstudents;
    this.incompatible=incompatible;
    this.preparatory=preparatory;
    this.enrolled=enrolled;
 
}

exports.Course = Course;