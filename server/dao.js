'use strict'
const sqlite = require('sqlite3');
const {Course} = require('./course');
const {StudyPlanCourse} = require('./studyplancourse')

const db = new sqlite.Database('corsi.sqlite', (err) => {
    if (err) throw err;
});


//get all courses
exports.getCourses = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM corsi ORDER BY name";
        db.all(sql, [], (err, rows) => {
            if (err)
                reject(err);
            else {
                const courses = rows.map(row => new Course(row.id, row.name, row.cfu, row.maxstudents, row.incompatible, row.preparatory, row.enrolled));
                resolve(courses);
            }
        });
    })
}


//get StudyPlan
exports.getStudyPlan = (user) => {
    return new Promise((resolve, reject) => {
        const sql = "select courseid, name, cfu, maxstudents, incompatible, preparatory, enrolled from pianostudi,corsi where courseid = id AND userid = ?  ";
        db.all(sql, [user], (err, rows) => {
            if (err)
                reject(err);
            else {
                const courses = rows.map(row => new StudyPlanCourse(row.courseid, row.name, row.cfu, row.maxstudents, row.incompatible, row.preparatory, row.enrolled));
                resolve(courses);
            }
        });
    })
}

//add new courses to studyplan
exports.addAll = (id, courses) => {
    return new Promise((resolve, reject) => {
        for(let i = 0; i< courses.length; i++){
            let course = courses[i].courseid;
        const sql = "INSERT INTO pianostudi (courseid, userid)  values (?,?) ";
        db.run(sql, [course, id], function (err) {
            if (err){ reject(err);
                return;
            }else resolve(null);        
        })
    }
    });
}

//update max courses on correct save
exports.updateEnrolledNumber= (courses, sign) => {
    return new Promise((resolve, reject) => {
        for(let i = 0; i< courses.length; i++){
            let course = courses[i].courseid;
        const sql = "UPDATE corsi set enrolled = enrolled + ? where id = ?";
        db.run(sql, [sign, course], function (err) {
            if (err){ reject(err);
                return;
            }else resolve(null);            
        })
    }
    });
}

//delete All from studyplan
exports.deleteAll = (userid) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM pianostudi WHERE userid = ?";
        db.run(sql, [userid], function (err) {
            if (err){reject(err);
            return(console.log(err));
             } else resolve(null);
        })
    });
}

//update user enrollment
exports.updateEnrollment = (userid, enrollment) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE  users set enrollment = ? WHERE id= ?";
        db.run(sql, [enrollment, userid], function (err) {
            if (err) reject(err);
            else resolve(null);
        })
    });

} 
