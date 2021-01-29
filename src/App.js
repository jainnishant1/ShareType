import './App.css';
import Login from './components/Login'
import Register from './components/Register'
import Editor from './components/Editor/Editor'
import DocScreen from './components/DocScreen'
import {BrowserRouter,Route} from 'react-router-dom'
import { useState } from 'react'

const App = () => {
  
  return (
    <BrowserRouter>
    <Route exact path="/">
      <Login />
    </Route>
    <Route path="/register">
      <Register />
    </Route>
    <Route path="/docScreen">
      <DocScreen />
    </Route>
    <Route path="/editor">
      <Editor />
    </Route>
    </BrowserRouter>

  );
}

export default App;
