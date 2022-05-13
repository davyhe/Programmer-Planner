import { useState, useContext, useEffect} from "react";
import api from "../../apis/api";
import { useNavigate } from "react-router-dom";
import { AccountContext } from '../../contexts/AccountContext';
import { AlertContext } from "../../contexts/AlertContext";


// Login page (Manuel Trevino)
const Login = () => {

  const navigate = useNavigate();

  /*  States and Contexts  */

  const {user, setUser} = useContext(AccountContext);
  const {setAlerts} = useContext(AlertContext);
  
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });


  /* api function handlers */

  const handleSubmit = (e) => {
    e.preventDefault();

    api.post('/login', {
      email: formValues.email,
      password: formValues.password
    })
    .catch(err => {
        console.log(err);
    })
    .then(res => {
        //api call went good
        if(!res || res.status >= 400 || res.data.type == "error") {
          
            if(res && res.data) {
              setAlerts({type: res.data.type, status: res.data.status});
            }
        } 
        else {
            setUser(res.data.data);
            
            setAlerts(null);
            navigate("/");
        }
    });
  }


  /*  Helper functions */

  const handleChange = e => {
    const { name, value } = e.target;
    setFormValues(formValues => ({
        ...formValues,
        [name]: value
    }));
};
  
  return ( 
    
    <>

      {/* Render Login Form */}
      <div className="container p-5 w-75 m-5 mx-auto">
        <h1 className="text-center">Log In</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-2">
            <label htmlFor="exampleInputEmail1">Email address</label>
            <input name="email" onChange={handleChange} type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" required/>
            <div className="invalid-feedback">Please enter an email address</div>
          </div>
          <div className="form-group mb-4">
            <label htmlFor="exampleInputPassword1">Password</label>
            <input name="password" onChange={handleChange} type="password" className="form-control" id="exampleInputPassword1" placeholder="Password" required/>
          </div>
          <button type="submit" className="btn btn-primary">Log In</button>
          <button onClick={() => navigate('/sign-up')} type="button" className="btn btn-primary ms-3">Sign Up</button>
        </form>    
      </div>

    </>
   );
}
 
export default Login;