import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import './addUser.css';

const AddUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isValid = () => {
    if (name === "" || email === "" || password === "") {
      alert("Please fill in all the details:");
      return false;
    }
    return true;
  };

    const navigate = useNavigate();
  const addToDatabase = () => {
    if (!isValid()) {
    } else {
      Axios({
        method: 'post',
        url: "http://localhost:3000/register",
      data: {
        name: name,
        email: email,
        password: password
      }
    }) 
    .then(response => { console.log(response);
        let path = '/chat'; 
        navigate(path ,{ state: { id:response.data.id, name: response.data.name}} );
      })
      .catch(error => {
        alert('did not work')
      });
    }
  };
  
  return (
    <div className="container2">
      <form action="">
        <div className="">
          <div className="col-md-12 mb-4 ">
            {" "}
            <input
              className="form-control"
              type="text"
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
            />{" "}
          </div>
        </div>
    
        <div className="col-12 mb-4">
          {" "}
          <input
            type="email"
            placeholder="email"
            className="form-control"
            onChange={(e) => setEmail(e.target.value)}
          />{" "}
        </div>
        <div className="col-12 mb-4">
          {" "}
          <input
            type="password"
            placeholder="password"
            className="form-control"
            onChange={(e) => setPassword(e.target.value)}
          />{" "}
        </div>
        <div className="row">
          <div className="col-12 mb-4">
            <div className="btn btn-primary d-block" onClick={addToDatabase}>
              ADD
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddUser;
