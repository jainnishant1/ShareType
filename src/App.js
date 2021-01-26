import './App.css';
import Login from './components/Login'
import Register from './components/Register'
import Editor from './components/Editor/Editor'
import DocScreen from './components/DocScreen'
import { useState } from 'react'

const App = () => {
  const [page, setPage] = useState("Login")

  const updateToLogin = () => {
    setPage("Login")
  }

  const updateToRegister = () => {
    setPage("Register")
  }

  const updateToEditor = () => {
    setPage("Editor")
  }

  const updatetoDocScreen = ()=>{
    setPage("DocScreen")
  }

  return (
    <div className="App">
      {page == "Login" ? <Login toLogin={updateToLogin} toRegister={updateToRegister} toEditor={updateToEditor} toDoc={updatetoDocScreen}/> : null}
      {page == "Register" ? <Register toLogin={updateToLogin} toRegister={updateToRegister} toEditor={updateToEditor} /> : null}
      {page == "DocScreen" ? <DocScreen toLogin={updateToLogin}/> : null}
      {page == "Editor" ? <Editor /> : null}
    </div>

  );
}

export default App;
