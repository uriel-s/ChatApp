import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";

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
    .then(response => {
        let path = '/chat'; 
        navigate(path ,{ state: { id:response.data.id, name: response.data.name}} );
      })
      .catch(error => {
        alert(error.response.data.message)
      });
    }
  };
  const returnToLoginPage = () => {
    navigate('/');
  }

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
            <button className="btn btn-primary d-block" onClick={addToDatabase}>
              ADD
            </button>
          </div>
          <br/>
          <div className="col-12 mb-4">
            <button className="btn btn-primary d-block" onClick={returnToLoginPage}>
              return to login page
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddUser;
