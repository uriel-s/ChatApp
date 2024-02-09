import React, { useState, useEffect } from "react";
import Axios from 'axios';

import { createBrowserRouter,  RouterProvider } from 'react-router-dom';
import Home from "./components/loginPage";
import AddUser from "./components/addUser";
import ChatPage from './components/chatPage';



 function App(){
 
    const router = createBrowserRouter([
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/register",
        element: <AddUser />,
      },
      {
        path: "/chat",
        element: <ChatPage />,
      }
    ])
    return (
      <RouterProvider router={router} />
  )
}


export default App