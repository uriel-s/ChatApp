import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import './loginPage.css';


const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate();
        
    const onButtonClick = () => {
      Axios({
        method: 'post',
        url: "http://localhost:3000/login",
      data: {
        email: email,
        password: password
      }
    }) .then(response => {
        let path = '/chat'; 
       
        navigate(path , { state: { id:response.data.id, name: response.data.name} });
      })
      .catch(error => {
       alert('wrong details')
      });
    }
    const onButtonClickSingUp = () => {
        let path = '/register'; 
        navigate(path);
    }


    return <div className={"mainContainer"}>
        <div className={"titleContainer"}>
            <div>Login</div>
        </div>
        <br />
        <div className={"inputContainer"}>
            <input
                value={email}
                placeholder="Enter your email here"
                onChange={e => setEmail(e.target.value)}
                className={"inputBox"} />
        </div>
        <br />
        <div className={"inputContainer"}>
            <input
                value={password}
                placeholder="Enter your password here"
                onChange={e => setPassword(e.target.value)}
                className={"inputBox"} />
        </div>
        <br />
        <div className={"inputContainer"}>
            <input
                className={"inputButton"}
                type="button"
                onClick={onButtonClick}
                value={"Log in"} />
        </div>

        <div className={"inputContainer"}>
            <input
                className={"inputButton"}
                type="button"
                onClick={onButtonClickSingUp}
                value={"Sign Up"} />
        </div>
    </div>
}

export default Login