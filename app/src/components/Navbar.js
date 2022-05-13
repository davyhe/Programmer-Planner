import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import api from '../apis/api';
import { AccountContext } from '../contexts/AccountContext'
import { AlertContext } from "../contexts/AlertContext";
import { TeamContext } from '../contexts/TeamContext';
import { Link, useLocation } from 'react-router-dom';


// render navbar (Manuel trevino)
const ConditionalNav = () => {

  const location = useLocation();
  const navigate = useNavigate();

  /*  States and Contexts  */

  const {setAlerts} = useContext(AlertContext)
  const {user, setUser} = useContext(AccountContext);
  const {team, setTeam} = useContext(TeamContext);


  /* api function handlers */

  const handleLogout = (e) => {

    e.preventDefault();
    api.get("/logout")
      .catch(err => {
        console.log(err);
      })
      .then(res => {
        if(!res || res.status >= 400) {
          console.log("Status code > 400");
      } 
      else {
          setUser(res.data.data);
          navigate("/login");
      }
      });

  }


    
  return (
    <>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav ms-auto">
        {user.loggedIn &&
        <>
          <li className="nav-item">
            <a className="nav-link active" href="#" onClick={() => navigate("/")} aria-current="page">Home</a>
          </li>
          {team &&
          <>
            <li className="nav-item">
              <a className="nav-link" href="#" onClick={() => navigate("/questions")}>Forum</a>
            </li>
          
            <li className="nav-item">
              <a className="nav-link" href="#" onClick={() => navigate("/tasks")}>Tasks</a>
            </li>
          </>
          }
          <li className="nav-item">
            <a className="nav-link" href="#" onClick={() => navigate("/planner")}>Planner</a>
          </li>
          <li className="nav-item">
              <a className="nav-link" href='#' onClick={() => {setAlerts(null); navigate("/account-settings");}}>Settings</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#" onClick={handleLogout}>Logout</a>
          </li>
        </>
        }
      </ul>
    </div>
    </>
  )
}

const Navbar = () => {
  
  const navigate = useNavigate();
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <a className="navbar-brand" href="#" onClick={() => navigate("/")}>Programmer Planner</a>
        <ConditionalNav></ConditionalNav>
      </div>
    </nav>
  )
}

export default Navbar