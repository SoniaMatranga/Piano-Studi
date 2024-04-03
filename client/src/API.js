
const APIURL = new URL('http://localhost:3001/api/');  // Do not forget '/' at the end

//================================== HOME PAGE API =============================

 // call: GET /api/courses
async function getCourses() {
  const response = await fetch(new URL('courses', APIURL), {credentials: 'include'});
  const courseJson = await response.json();
  if (response.ok) {
    return await courseJson.map((course) => ({ id: course.id, name: course.name, cfu: course.cfu, maxstudents: course.maxstudents,
       incompatible: course.incompatible, preparatory: course.preparatory, enrolled: course.enrolled}));
  } else {
    throw courseJson;  // an object with the error coming from the server
  }
}


//=================================== LOGGED IN API =============================
 // call: GET /api/studyplan
async function getStudyPlan() {
  const response = await fetch(new URL('studyplan', APIURL), {credentials: 'include'});
  const courseJson = await response.json();
  if (response.ok) {
    return await courseJson.map((course) => ({ courseid: course.courseid, coursename: course.coursename, cfu: course.cfu,  maxstudents: course.maxstudents,
      incompatible: course.incompatible, preparatory: course.preparatory, enrolled: course.enrolled}));
  } else {
    throw courseJson;  // an object with the error coming from the server
  }
}

// call: POST /api/edit 
async function addAll(studyplan) {
  return new Promise((resolve, reject) => {
    fetch(new URL('edit', APIURL), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({studyplan: studyplan}),

    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        response.json()
          .then((message) => { reject(message); })
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      }
    }).catch(() => { reject({ error: "Cannot communicate with server." }) });
  });
} 

// call: PUT /api/edit
async function updateEnrolledNumber(studyplan, sign) {
  return new Promise((resolve, reject) => {
    fetch(new URL('edit', APIURL), {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({studyplan: studyplan, sign: sign} ),

    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        response.json()
          .then((message) => { reject(message); })
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      }
    }).catch(() => { reject({ error: "Cannot communicate with server." }) });
  });
} 

// call: DELETE /api/edit
function deleteAll() {
  return new Promise((resolve, reject) => {
    fetch(new URL('edit' , APIURL), {
      method: 'DELETE',
      credentials: 'include'
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

// call: PUT api/enrollment
function updateEnrollment(enrollment) {
  return new Promise((resolve, reject) => {
    fetch(new URL('enrollment'  , APIURL), {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({enrollment: enrollment}),
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}



//================================== LOGIN API ===============================================

async function logIn(credentials) {
  let response = await fetch(new URL('sessions', APIURL), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

async function logOut() {
  await fetch(new URL('sessions/current', APIURL), { method: 'DELETE', credentials: 'include' });
}

async function getUserInfo() {
  const response = await fetch(new URL('sessions/current', APIURL), {credentials: 'include'});
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}

//=====================================================================


const API = {getCourses, logIn, logOut, getUserInfo, getStudyPlan, deleteAll, updateEnrollment, addAll, updateEnrolledNumber};

export default API;