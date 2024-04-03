'use strict'

const express = require('express');
const morgan = require('morgan');
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./user-dao'); // module for accessing the users in the DB
const dao = require('./dao');
const cors = require('cors');
const { check, validationResult } = require('express-validator'); // validation middleware



/*========================== Set up Passport =============================*/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});


//======================= init =======================
const app = new express();
const port = 3001;

app.use(morgan('dev'));
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions)); // NB: Usare solo per sviluppo e per l'esame! Altrimenti indicare dominio e porta corretti

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'not authenticated' });
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());


/*============================ APIs ========================================*/

// GET /api/courses
app.get('/api/courses', (request, response) => {
  dao.getCourses()
    .then(courses => response.json(courses))
    .catch(() => response.status(500).json({ error: `Database error while retrieving courses` }).end());
});

// GET /api/studyplan
app.get('/api/studyplan', isLoggedIn, (request, response) => {
  dao.getStudyPlan(request.user.id)
    .then(courses => response.json(courses))
    .catch(() => response.status(500).json({ error: `Database error while retrieving studyplan` }).end());
});

//POST /api/edit 
app.post('/api/edit', isLoggedIn, [
  check('studyplan').custom((studyplan, { req }) => {
    return dao.getCourses()
      .then(courses => {
        const errorplan = courses.filter((c) => {
          return studyplan.find(course => {
            c.id !== course.courseid || c.name !== course.coursename || c.cfu !== course.cfu
              || c.maxstudents !== course.maxstudents ||
              c.incompatible !== course.incompatible || c.preparatory !== course.preparatory || c.enrolled !== course.enrolled
          })
        }
        )
        //check if some course is not taken from the original list of courses
        if (errorplan.length > 0) {
          throw new Error("Error in the studyplan")
        }
        const realplan = courses.filter((c) => {
          return studyplan.find(s => c.id === s.courseid)
        })

        //check cfu
        const currentCfu = realplan.map(c => c.cfu).reduce((c1, c2) => (c1 + c2));
        const max = (req.user.enrollment === "full-time") ? 80 : 40;
        const min = (req.user.enrollment === "full-time") ? 60 : 20;
        if (currentCfu > max || currentCfu < min) {
          console.log("error in total cfu")
          throw new Error("Error in total number of cfu.")
        }

         //check preparatory
        for (let course in realplan) {
          console.log(realplan[course].preparatory)
          if (realplan[course].preparatory && realplan.find(c => c.id === realplan[course].preparatory) === undefined) {
            throw new Error(`The course "${realplan[course].name}" has a preparatory constraint`)
          }
        }

        //check incompatible
        for (let course in realplan) { 
          console.log(realplan[course].incompatible)
         let incompatible = realplan[course].incompatible.split(",");
        
          incompatible.forEach(i => {
            if (realplan[course].incompatible && realplan.find(c => c.id === i) !== undefined) {
              throw new Error(`Courses in the studyplan are incompatible`)
            }
          })
        } 

      }
      ).catch((err) => {
        throw new Error(err)
      });
    
  })
], async (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(422).json({ errors: errors.array() });
  }
  try {
    await dao.addAll(request.user.id, request.body.studyplan);
    response.status(201).end();
  }
  catch (err) {
    response.status(503).json({ error: `Database error during the creation of courses.` });
  }
});

//PUT /api/edit
app.put('/api/edit', isLoggedIn, [
  check('sign').isIn([-1, +1]),
  check('studyplan').custom((studyplan, { req }) => {

    return dao.getCourses()
      .then(courses => {
        const errorplan = courses.filter((c) => {
          return studyplan.find(course => {
            c.id !== course.courseid || c.name !== course.coursename || c.cfu !== course.cfu
              || c.maxstudents !== course.maxstudents ||
              c.incompatible !== course.incompatible || c.preparatory !== course.preparatory || c.enrolled !== course.enrolled
          })
        }
        )
        //check if some course is not taken from the original list of courses
        if (errorplan.length > 0) {
          throw new Error("Error in the studyplan")
        }
        const realplan = courses.filter((c) => {
          return studyplan.find(s => c.id === s.courseid)
        })

        //check max students 
        for (let course in realplan) {
          if (realplan[course].maxstudents && req.body.sign === +1 && realplan[course].enrolled > realplan[course].maxstudents) {
            throw new Error(`The course "${realplan[course].name}" has reached the max students enrolled`)
          }
          else if (realplan[course].enrolled < 0 && req.body.sign === -1) {
            throw new Error(`Error in updating enrolled students`)
          }
        }  

      }).catch((err) => {
        throw new Error(err)
      });
  }

  )
], async (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(422).json({ errors: errors.array() });
  }
  try {
    await dao.updateEnrolledNumber(request.body.studyplan, request.body.sign);
    response.status(201).end();
  }
  catch (err) {
    response.status(503).json({ error: `Database error during the creation of course on student's number update .` });
  }
});

//DELETE /api/edit
app.delete('/api/edit', isLoggedIn, async (request, response) => {
  try {
    await dao.deleteAll(request.user.id);
    response.status(204).end();
  } catch (err) {
    response.status(503).json({ error: `Database error during the deletion of studyplan.` });
  }

});

//PUT api/enrollment
app.put('/api/enrollment', isLoggedIn, [
  check('enrollment').isIn(['', 'full-time', 'part-time'])
], async (request, response) => {

  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(422).json({ errors: errors.array() });
  }
  try {
    await dao.updateEnrollment(request.user.id, request.body.enrollment);
    response.status(204).end();
  } catch (err) {
    response.status(503).json({ error: `Database error during the update of enrollment.` });
  }
});



/*====================== Users APIs ==============================*/

// POST /api/sessions (login)
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});

// DELETE /sessions/current  (logout)
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => { res.end(); });
});

// GET /sessions/current (checkloggedIn)
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Unauthenticated user!' });;
});







app.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
