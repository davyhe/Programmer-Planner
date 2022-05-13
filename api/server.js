require("dotenv").config()

// start server
const express = require('express')
const session = require('express-session')
const app = express(),
      bodyParser = require("body-parser");
      port = process.env.PORT || 3000;
const morgan = require('morgan')
const bcrypt = require('bcrypt');
const { cookie, json } = require("express/lib/response");
const crypto = require("crypto");
const req = require("express/lib/request");
const { compareSync } = require("bcrypt");

const Pool = require('pg').Pool
const db = new Pool();
let query = "";

db.connect(function(err) {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log("Connected to database!");
});


app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})

app.use(morgan('dev'))
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
    next();
});

app.use(session({
    secret: process.env.COOKIE_SECRET,
    credential: true,
    name: "sid",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.ENVIRONMENT === "production",
        httpOnly: true,
        expires: 1000*60*60*24*7,
        sameSite: process.env.ENVIRONMENT === "production" ? "none" : "lax"

    }
}))


/*  User - Login feature (Manuel Trevino) */

app.get('/api/logout', (req, res) => {
    req.session.user = null;
    res.json({data: {loggedIn: false}, status: "User logged out"})
});

app.get('/api/login', (req, res) => {
    if(req.session.user && req.session.user.id) {

        console.log(req.session.user);
        res.json({data: {loggedIn: true, ...req.session.user}});
        
    } else {
        res.json({data: {loggedIn: false}})
    }
});

app.post('/api/login', async (req, res) => {

    try {
        const potentialLogin = await db.query("SELECT * FROM users WHERE email = $1", [req.body.email]);
        
        // user with that email exists in the database
        if(potentialLogin.rowCount > 0) {
            const validPassword = await bcrypt.compare(req.body.password, potentialLogin.rows[0].password);
            
            let user = potentialLogin.rows[0];
            if(validPassword) {

                // create cookie to be sent by the server
                req.session.user = {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name
                }

                user = {loggedIn: true, id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name}
                res.json({data: user, status: "User Logged in"})            
            }
            else {
                res.status(200).json({data: {loggedIn: false}, type:"error", status: "Wrong email or password!"})
            }
        }
        else {
            res.status(200).json({data: {loggedIn: false}, type:"error", status: "Wrong email or password!"})
        }

    } catch(err) {
        console.log(err)
        res.status(422).json({data: {loggedIn: false}, status: "Unprocessable entity"})
    }
});

app.post('/api/signup', async (req, res) => {

    try {
        
        const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [req.body.email])

        // check that the user does not exist
        if(existingUser.rowCount === 0) {

            //register account
            let data = req.body
            const hashedPassword = await bcrypt.hash(data.password, 10)

            let potentialUser = null;
            do {
                var api_token = crypto.randomBytes(15).toString('hex')
                potentialUser = await db.query("SELECT * FROM users where api_token = $1", [api_token])

            } while (potentialUser && potentialUser.rowCount);

            const newUser = await db.query(`INSERT INTO users(email, password, first_name, last_name, api_token)
                                            values ($1,$2,$3,$4,$5) returning id, email, first_name, last_name`,
                                            [data.email, hashedPassword, data.first_name, data.last_name, api_token]);
            
            // create cookie to be sent by the server
            req.session.user = {
                id: newUser.rows[0].id,
                email: newUser.rows[0].email,
                first_name: newUser.first_name,
                last_name: newUser.last_name
            }

            res.status(200).json({data: {loggedIn: true, ...newUser.rows[0]} });
        }
        else {
            res.json({data: {loggedIn: false}, status: "Email has already been used."});
        }
    } catch (err) {
        console.log(err);
        res.status(422).json({data: {loggedIn: false}, status: "Unprocessable entity"})
    }


});

/* -------------------------------------- */


// middleware to authenticate and store user in req.user (Manuel Trevino)
app.use( async function(req, res, next) {

    // The user is being store in req.user from the session hash through middleware,
    // which can then be accessed in any authenticated route.
    // i.e. use req.user to set the user_id forerign key for any of the other models.

    if(req.session.user && req.session.user.id) {
        req.user = req.session.user
        next()
    }
    else if(req.headers.api_token) {
        try {   
            let User = await db.query("SELECT * FROM users WHERE api_token = $1", [req.headers.api_token]);
            if(User.rowCount) {
                User = User.rows[0];
                req.user = {loggedIn: true, id: User.id, email: User.email, first_name: User.first_name, last_name: User.last_name}
                next();
            }
            else {
                res.status(401).json({status: "User not logged in 1"});
            }
        } catch (err) {
            console.log(err);
        }
    }
    else {

        // if user doesn't have cookie nor api token, respond with unauthorized access
        res.status(401).json({status: "User not logged in"});
    }
});


/*  User feature  (Manuel Trevino)  */

app.put('/api/user/:id', async (req, res) => {

    //check that no other user has that email
    try {
        const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [req.body.email])
        if(existingUser.rowCount && existingUser.rows[0].id != req.user.id) {
            res.status(400).json({status: "Email is already being used"});
        }

        if(req.user.id == req.params.id) {
            const User = await db.query(`UPDATE users SET first_name = $1, last_name = $2, email = $3
                                         WHERE id = $4 RETURNING id, email, first_name, last_name, email`, 
                                        [req.body.first_name, req.body.last_name, req.body.email, req.user.id]);

            req.session.user.first_name = User.rows[0].first_name;
            req.session.user.last_name = User.rows[0].last_name;
            req.session.user.email = User.rows[0].email;
            
            res.json({data: User.rows[0]})
        }
        else {
            res.status(401).json({status: "Unauthorized access"});
        }
    }
    catch (err) {
        console.log(err);
        res.status(400).json({status: "Email is already being used"});
    }

});

app.put('/api/user/:id/password', async (req, res) => {

    if(req.user.id != req.params.id) {
        res.status(401).json({status: "Unauthorized access"});
        return;
    }

    try {

        // check that the old password matches the hashed one in the database
        const User = await (await db.query("SELECT * FROM users WHERE id = $1", [req.params.id])).rows[0];
        const validPassword = await bcrypt.compare(req.body.old_password, User.password);

        if(validPassword) {

            // hash new password and update the database
            const hashedPassword = await bcrypt.hash(req.body.new_password, 10);
            const UpdateQuery = await db.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, req.params.id]);
            res.status(200).json({type: "success", status: "Successfully update password"});

        }
        else {
            res.status(200).json({status: "Old password did not match!", type: "Error"})
        }


    }
    catch(err) {
        console.log(err);
        res.status(422).json({data: {loggedIn: false}, status: "Unprocessable entity", type: "error"})
    }
});

app.delete('/api/user/:id', async (req,res) => {


    if(req.user.id != req.params.id) {
        res.status(401).json({status: "Unauthorized access"});
        return;
    }

    try {
        await db.query("DELETE FROM users WHERE id = $1", [req.params.id]);
        
        // set session/cookie to null
        req.session.user = null;
        res.status(200).json({data: {loggedIn: false}, status: "User account deleted", type: "warning"})

    }
    catch(err) {
        console.log(err);
        res.status(422).json({data: {loggedIn: false}, status: "Unprocessable entity", type: "error"})
    }
});

/* -------------------------------------- */


/*  Answer Feature (Manuel Trevino)  */

// ROUTE: GET '/api/answers?question_id=$1'
app.get('/api/answers', async(req, res) => {

    try {
        let query = `SELECT answers.id, user_id, question_id, answer_text, answer_img_url, first_name, last_name FROM answers
                     INNER JOIN users ON user_id=users.id WHERE question_id=$1 ORDER BY answers.id ASC`;

        const Answers = await db.query(query,[req.query.question_id]);
        res.status(200).json({data: Answers.rows, status: "Success, got answers for question", type: "success"});

    }
    catch (err) {
        console.log(err);
        res.status(422).json({status: "Unable to get answers", type: "error"});
    }

});

// ROUTE: POST '/api/answers'
app.post('/api/answers', async(req, res) => {
    // here, one form of authentication would be to check that the user belongs to the team of
    // which the question belongs to (to be implemented)

    try {
        let query = `INSERT INTO answers(user_id, question_id, answer_text, answer_img_url)
                     values ($1,$2,$3,$4) returning *`;

        const NewAnswer = await db.query(query, [req.user.id, req.body.question_id, req.body.answer_text, req.body.answer_img_url]);
        res.status(200).json({data: NewAnswer.rows[0], status: "Success, created answer", type: "success"});
    }
    catch(err) {
        // Has to be sent as a status < 400 if you want to display an error message through the frontend
        console.log(err);
        res.status(422).json({status: "Unable to create answer", type: "error"});
    }

});

// ROUTE: PUT '/api/answers/:id'
app.put('/api/answers/:id', async(req, res) => {
    
    console.log(req.body);
    try {
        let query = "UPDATE answers SET answer_text=$1, answer_img_url=$2 WHERE id=$3 and user_id=$4 returning *";

        const UpdatedAnswer = await db.query(query, [req.body.answer_text, req.body.answer_img_url, req.params.id, req.user.id]);
        res.status(200).json({data: UpdatedAnswer.rows[0], status: "Success, updated answer", type: "success"});
    }
    catch(err) {
        console.log(err);
        res.status(422).json({status: "Unable to update answer", type: "error"});
    }
});

// ROUTE: DELETE '/api/answers/:id'
app.delete('/api/answers/:id', async(req, res) => {

    try {
        // ensures that only the owner can delete his answers
        let query = "DELETE FROM answers WHERE id=$1 and user_id=$2";

        await db.query(query, [req.params.id, req.user.id]);
        res.status(200).json({status: "Success, delete answer", type: "success"});
        
    }
    catch(err) {
        console.log(err);
        res.status(422).json({status: "Unable to update answer", type: "error"});
    }

});

/* -------------------------------------- */


// ----- Tasks & Questions Functions -----

/* Create a new task from the information input by user by inserting into tasks table in the database -- Fabianna Barbarino */
app.post('/api/task', (req, res) => {

    /* Grabbing the task object */
    const task = req.body.task;
    console.log('Adding Task:', task);

    /* Grabbing each value needed from the task object sent in */
    const description = task.taskDescription;
    const sprintNum = task.sprint;                                             
    const id = task.id;   
    const timeNow = Date.now();
    const dateCreated = new Date(timeNow);
    const dueDate = task.dueDate; 

    /* Inserting new task into the database */
    db.query('INSERT INTO tasks (user_id, sprint_id, task_content, assigned_date, due_date) VALUES ($1, $2, $3, $4, $5)', [id, sprintNum, description, dateCreated, dueDate], (err, res) => {
        if(err) throw err;
        console.log("Added task to database")
    }) 
  
});

/* Finding all the sprints based on team_id -- Fabianna Barbarino */
app.post('/api/getSprintId', async (req, res) => {
    try {
        

        /* Helpful logs to see which team is currently selected on the page */
        const team_id = req.body.team_id; // team_id parameter
        
        if (team_id) {
        const sprint = await db.query("SELECT * FROM sprints WHERE team_id = $1",[team_id])
        res.status(200).json({data: sprint.rows, status: "success, got users",  type: "success"}) // sending the sprints found in an array
        }
        else {
            res.status(200).json({data: [], status: "no team_id was provided", type: "error"});
        }

    } catch (err) {
        console.error('Error in SprintID: ' + err.message);
        res.status(422).json({status: "unable to get sprints", type: "error"})
    }   
});

/* Delete an existing task from the database by the id sent in -- Fabianna Barbarino */
app.post('/api/deleteTask', (req, res) => {

    /* Grabbing the task id */
    const task_id = req.body.task_id;
    console.log('Deleting task with id: ', task_id);
                                     
    /* Deleting the specified task from the database */
    db.query('DELETE FROM tasks WHERE id = $1', [task_id], (err, res) => {
        if(err) throw err;
        console.log("Deleted task in database")
    }) 
  
});

/* Edit an existing task in the database by the id sent in -- Fabianna Barbarino */
app.post('/api/editTask', (req, res) => {
    console.log(req.body)

    /* Grabbing all the task inputs sent from page. If a certain field was not changed, then it is set as the previous value. */
    const curr_taskId = req.body.task_id;
    const new_userId = req.body.newId;
    const new_sprint = req.body.newSprint;
    const new_content = req.body.newText;
    const new_status = req.body.newStatus;
    const new_endDate = req.body.endDate;

    /* Updating the specified task in the database */
    db.query('update tasks set user_id = $1, sprint_id = $2, task_content = $3, status = $4, due_date = $5 where id=$6', [new_userId, new_sprint, new_content, new_status, new_endDate, curr_taskId], (err, res) => {
        if(err) throw err;
        console.log("Edited task in database")
    }) 
  
});

//GET TODO TASKS
app.get('/api/tasks', async (req, res) => {
  try {
    const status = req.query.status;
    const sprint_id = req.query.sprint_id;
    const allTasks = await db.query("SELECT t.*, CONCAT(u.first_name, ' ', u.last_name) as fullname FROM tasks t INNER JOIN users u ON t.user_id=u.id WHERE status=$1 AND sprint_id=$2",[status, sprint_id]);
    res.json(allTasks.rows);
    
  } catch (err) {
        console.error(err.message);
  }
})


// //EDIT TASK
// app.put('/api/task/todo', async (req, res) => {
//     try {
        
//     } catch (err) {
//         console.error(err.message);
//     }
// })

app.post('/api/question', async (req, res) => {
    
    const userID = req.user.id;
    const teamID = req.body.team_id;
    const description = req.body.question_text;

    console.log(userID);
    console.log(teamID);
    console.log(description);

    // INSERT question into questions table
    query = `INSERT INTO questions (user_id, team_id, question_text) VALUES ($1,$2,$3)
             RETURNING * `;

    try {

        const newQuestion = await db.query(query,[userID, teamID, description])
        res.status(200).json({data: newQuestion.rows[0], status: "Success, created new question!", type: "success"});

    }
    catch(err) {
        console.log(err);
        res.status(422).json({status: "Unprocessable entity", type: "error"})
    }
  
});

/* Delete an existing question from the database by the id sent in -- Fabianna Barbarino */
app.delete('/api/questions/:id', async(req, res) => {
    try {

        let query = "DELETE FROM questions WHERE id=$1 and user_id=$2";

        /* Deleting the specified question from the database */
        await db.query(query, [req.params.id, req.user.id]);
        res.status(200).json({status: "Success, delete question", type: "success"});
    }
    catch(err) {
        console.log(err);
        res.status(422).json({status: "Unable to update question", type: "error"});
    }

});

/* Edit an existing question from the database by the id sent in -- Fabianna Barbarino */
app.post('/api/editQuestion', (req, res) => {
    console.log("EDIT QUESTION")
    console.log(req.body)

    /* Grabbing the question id and updated text which was sent from the page */
    const curr_questionId = req.body.currId;
    const new_content = req.body.newText;

    /* Updating the specified question from the database */
    db.query('update questions set question_text = $1 where id=$2', [new_content, curr_questionId], (err, res) => {
        if(err) throw err;
        console.log("Edited question in database")
    }) 
  
});

//get questions
app.get('/api/questions', async (req, res) => {
    
    /* Grabbing all the questions from the server. I added an inner join to grab the first name & last name -- Fabianna Barbarino */
    let query = "SELECT Q.id, Q.user_id, Q.team_id, Q.question_text, U.first_name, U.last_name FROM questions Q INNER JOIN users U ON Q.user_id=U.id WHERE team_id = $1";

    // when using url "?"" params, use req.query to access
    try {
        console.log(req.query);
        const questions = await db.query(query, [req.query.team_id]);
        res.status(200).json({data: questions.rows, status: "success, got questions", type: "success"})
    }
    catch(err) {
        console.log(err);
        res.status(422).json({status: "Unable to get questions", type: "error"})
    }
});
  
/* Grabbing all the users in a specific team from the datbase -- Fabianna Barbarino */
app.post('/api/getTeamUsers', async (req, res) => {
    
    try {
        const team_id = req.body.team_id; //team_id parameter

        if(team_id) {
            let query = "select u.id as u_id, t.user_id as t_id, t.team_id as t_team_id, concat(u.first_name,' ', u.last_name) as u_username from users u inner join team_developers t on u.id=t.user_id where t.team_id = \'" + team_id + "\' order by u.id desc;"
            const result = await db.query(query);
            if (result && result.rows) {
                res.status(200).json({data: result.rows, status: "success, got users", type: "success"})
            } else {
                res.status(200).json({data: [], status: 'No users found', type: "error"});
            }
        }
        else {
            res.status(200).json({data: [], status: "No team_id was provided", type: "error"})
        }          
    }
    catch(err) {
        console.log(err);
        res.status(200).json({status: "Unable to get users", type: "error"});
    }
});

/* -------------------------------------- */


// ----- SprintsView -----

//POST
app.post("/api/sprints", async (req,res) => {
  try {
    
    //parameters for insert grabbed from body in SprintSettings.js
    const newSprintName = req.body.sprint_name;
    const team_id = req.body.team.id;
    const user_id = req.body.user.id;

    const newTask = await db.query(`INSERT INTO sprints (team_id, sprint_name) VALUES(${team_id}, '${newSprintName}') RETURNING *`);

    res.json(newTask.rows);
  } catch (err) {
    console.error(err.message);
  }
})


//Get a sprint based on team_id
app.get('/api/sprints', async(req, res) => {
  try {
    const team_id = req.query.team_id; //team_id parameter
    const sprint = await db.query("SELECT * FROM sprints WHERE team_id = $1",[team_id]);
    res.json(sprint.rows);
  } catch (err) {
    console.error(err.message);
  }
})

  
//Update a sprint
//app.put
app.put('/api/sprints', async(req, res) => {
    try {
        const sprint_id = req.query.sprint_id;
        const sprint_name = req.body.sprint_name;
        const updateSprint = await db.query(`UPDATE sprints SET sprint_name = '${sprint_name}' WHERE id=${sprint_id}`);
        res.json("Sprint was updated!");
    } catch (err) {
        console.error(err.message);
    }
})



//Delete a sprint_id
app.delete('/api/sprints', async(req, res) => {
  try {

    const sprint_id = req.query.sprint_id; //team_id parameter
    console.log(sprint_id);
    const delete_sprint = await db.query("DELETE FROM sprints WHERE id = $1",[sprint_id]);
    res.json(delete_sprint);
  } catch (err) {
    console.error(err.message);
  }
})


// Membership in a Team

// Below query is query for getting users not in current team that doesn't quite work
// SELECT DISTINCT user_id, users.first_name, users.last_name FROM team_developers, users WHERE team_developers.team_id != ${team_id} AND team_developers.user_id = users.id;

//get users that are in the team with id of team_id
app.get('/api/membership', async(req, res) => {
    try {
        const team_id = req.query.team_id; //get team id from url
        const users = await db.query(`SELECT * FROM team_developers WHERE team_id = ${team_id}`); //get users in team to filter
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
    }
})


app.post('/api/membership', async(req, res) => {
    try {
        const user_id = req.body.user_id;
        const team_id = req.body.team_id;
        const insertToTeam = await db.query(`INSERT INTO team_developers (user_id, team_id) VALUES (${user_id}, ${team_id})`);

        res.json(insertToTeam.rows);
    } catch (err) {
        console.error(err.message);
    }
})

app.delete('/api/membership', async(req, res) => {
    try {
        const user_id = req.query.user_id;
        const team_id = req.query.team_id;
        const deleteFromTeam = await db.query(`DELETE FROM team_developers WHERE user_id=${user_id} AND team_id=${team_id}`)

        res.json(deleteFromTeam);
    } catch (err) {
        console.error(err.message);
    }
})

app.get('/api/getOwner', async(req, res) => {
    try {
        const team_id = req.query.team_id;
        const owner = await db.query(`SELECT user_id FROM teams WHERE id=${team_id}`)

        res.json(owner.rows);
    } catch (err) {
        console.error(err.message);
    }
})


app.get('/api/allNames', async(req, res) => {
    try {
        const name = await db.query(`SELECT * FROM users`);
        res.json(name.rows);
    } catch (err) {
        console.log("DDEBUG");
        console.error(err.message);
    }
})


app.get('/api/name', async(req, res) => {
    try {
        const user_id = req.query.user_id;
        const name = await db.query(`SELECT * FROM users WHERE id=${user_id}`);
        res.json(name.rows);
    } catch (err) {
        console.error(err.message);
    }
})



/// Teams Page feature set (Davy He)
/// display all team base on the current user id
app.get('/api/teams', async (req, res) => {
    let query = "SELECT * FROM teams WHERE user_id = $1";

    // when using url "?"" params, use req.query to access
    try {
        const teams = await db.query(query, [req.user.id]);
        res.status(200).json({data: teams.rows, status: "success, got team_info"})
    }
    catch(err) {
        console.log(err);
        res.status(422).json({status: "Unable to get team_info", type: "error"})
    }
});

app.get('/api/members', async (req, res) => {
    try {
        const team_id = req.query.team_id;
        const members = await db.query(`SELECT users.id, users.first_name, users.last_name, users.email FROM users, team_developers WHERE team_developers.team_id=${team_id} AND users.id=team_developers.user_id`);

        res.json(members.rows);
    } catch (err) {
        console.error(err.message);
    }
})

//get all teams
app.get('/api/allTeams', async(req, res) => {
    try {
        const allTeams = await db.query('SELECT * FROM teams');
        res.json(allTeams.rows);
    } catch (err) {
        console.error(err.message);
    }
})



app.put('/api/moveDev', async(req, res) => {
    try {
        const new_team = req.body.new_team;
        const old_team = req.body.old_team;
        const user_id = req.body.user_id;

        const editDeveloperTeam = db.query(`UPDATE team_developers SET team_id=${new_team} WHERE user_id=${user_id} AND team_id=${old_team}`);
        res.json(editDeveloperTeam.rows);
    } catch (err) {
        console.error(err.message);
    }
})

app.post('/api/set_team', (req, res) => {
    req.session.team = req.body.team;
    res.status(200).json(req.session.team);
});

app.get('/api/get_team', (req, res) => {
    res.status(200).json(req.session.team);
});

// add a new team with customize team name for current login user
app.post("/api/teams", async (req,res) => {

    const userID = req.user.id;
    const group_name = req.body.team_name;
    console.log(userID);
    console.log(group_name);
    query = `INSERT INTO teams (user_id, team_name) VALUES ($1,$2)
             RETURNING * `;

    try {

        const newTeam = await db.query(query,[userID, group_name])
        res.status(200).json({data: newTeam.rows[0], status: "Success, created new team!", type: "success"});

    }
    catch(err) {
        console.log(err);
        res.status(422).json({status: "Unprocessable entity", type: "error"})
    }
  });

  // delete the selected team that current user belong to
  app.delete('/api/teams/:id', async (req,res) => {

    const team_id = req.params.id;
    console.log('Deleting team with id: ', team_id);

    try {
        // ensures that only the owner can delete his answers
        let query = "DELETE FROM teams WHERE id = $1 and user_id = $2";

        await db.query(query, [team_id, req.user.id]);
        res.status(200).json({status: "Success, delete team", type: "success"});
        
    }
    catch(err) {
        console.log(err);
        res.status(422).json({status: "Unable to delete team", type: "error"});
    }

    
});

// update the team name with the selected team for current user
app.put('/api/teams/:id', async(req, res) => {
    console.log("team_name: "+req.body.team_name);
    console.log("user_id: "+req.user.id);
    try {
        let query = "UPDATE teams SET team_name=$1 WHERE id=$2 and user_id=$3 returning *";

        const UpdatedAnswer = await db.query(query, [req.body.team_name, req.params.id, req.user.id]);
        res.status(200).json({data: UpdatedAnswer.rows[0], status: "Success, updated answer", type: "success"});

    }
    catch(err) {
        console.log(err);
        res.status(422).json({status: "Unable to update answer", type: "error"});
    }
});

// if the current user is a developer of one or more team, display all that match with the current user id, team name and team id
// Otherwise, Display nothing.
app.get('/api/teams/developer', async (req, res) => {
    let query = "SELECT  team_developers.user_id, team_id, team_name FROM team_developers inner join teams on team_id = teams.id where team_developers.user_id = $1";

    
    try {
        const teams = await db.query(query, [req.user.id]);
        res.status(200).json({data: teams.rows, status: "success, got team developer info"})
    }
    catch(err) {
        console.log(err);
        res.status(422).json({status: "Unable to get developer info", type: "error"})
    }
});






// Personal Planner feature set (Davy He)
// get all the personal planner for current user
app.get('/api/planner', async (req, res) => {
    let query = "SELECT * FROM planner WHERE user_id = $1";

    // when using url "?"" params, use req.query to access
    try {
        const planner = await db.query(query, [req.user.id]);
        res.status(200).json({data: planner.rows, status: "success, got planner_info"})
    }
    catch(err) {
        console.log(err);
        res.status(422).json({status: "Unable to get planner_info", type: "error"})
    }
});

// add a planner with customize text for current user
app.post("/api/planner", async (req,res) => {

    const userID = req.user.id;
    const text = req.body.planner_text;
    const plann_status = false;
    console.log(userID);
    console.log(text);
    console.log(plann_status);
    query = `INSERT INTO planner (user_id, planner_text, status) VALUES ($1,$2,$3)
             RETURNING * `;

    try {

        const newPlanner = await db.query(query,[userID, text, plann_status])
        res.status(200).json({data: newPlanner.rows[0], status: "Success, created new planner!", type: "success"});

    }
    catch(err) {
        console.log(err);
        res.status(422).json({status: "Unprocessable planner", type: "error"})
    }
  });

  // delete the selected planner that current user belong to
  app.delete('/api/planner/:id', async (req,res) => {

    const planner_id = req.params.id;
    console.log('Deleting planner with id: ', planner_id);

    try {
        
        let query = "DELETE FROM planner WHERE id = $1 and user_id = $2";

        await db.query(query, [planner_id, req.user.id]);
        res.status(200).json({status: "Success, delete team", type: "success"});
        
    }
    catch(err) {
        console.log(err);
        res.status(422).json({status: "Unable to delete team", type: "error"});
    }

    
});

// update the planner text with the selected planner for current user
app.put('/api/planner/:id', async(req, res) => {
    console.log("text: "+req.body.planner_text);
    console.log("user_id: "+req.user.id);
    try {
        let query = "UPDATE planner SET planner_text=$1 WHERE id=$2 and user_id=$3 returning *";

        const UpdatedAnswer = await db.query(query, [req.body.planner_text, req.params.id, req.user.id]);
        res.status(200).json({data: UpdatedAnswer.rows[0], status: "Success, updated answer", type: "success"});

    }
    catch(err) {
        console.log(err);
        res.status(422).json({status: "Unable to update answer", type: "error"});
    }
});

// update the checkbox status of user task 
app.put('/api/planner_status/:id', async(req, res) => {
    console.log("status: "+req.body.status);
    console.log("user_id: "+req.user.id);
    const current_status = (req.body.status)
    try {
        let query = "UPDATE planner SET status=$1 WHERE id=$2 and user_id=$3 returning *";

        const UpdatedAnswer = await db.query(query, [current_status, req.params.id, req.user.id]);
        res.status(200).json({data: UpdatedAnswer.rows[0], status: "Success, updated answer", type: "success"});

    }
    catch(err) {
        console.log(err);
        res.status(422).json({status: "Unable to update answer", type: "error"});
    }
});


///
app.get('*', function(req, res){
    res.status(404).send("No route was found");
  });