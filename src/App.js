import './App.css';
import Login from './components/Login'
import Register from './components/Register'
import Editor from './components/Editor/Editor'
import DocScreen from './components/DocScreen'
import {BrowserRouter,Route} from 'react-router-dom'
import { useState } from 'react'

const App = () => {
  const [docContents,setDocContents] = useState([])
  const [docId,setDocId] = useState(null)
  const [docTitle,setDocTitle] = useState(null)
  const [doc,setDoc] = useState(null)

  const docHandler = (id,title,content,document)=>{
    setDocId(id)
    setDocTitle(title)
    setDocContents(content)
    setDoc(document)
    // console.log(content)
    // setTimeout(() => console.log("State of document was updated"), 1000);
  }
  return (
    <BrowserRouter>
    <Route exact path="/">
      <Login />
    </Route>
    <Route path="/register">
      <Register />
    </Route>
    <Route path="/docScreen">
      <DocScreen update={(id,title,content,document)=>{docHandler(id,title,content,document)}}/>
    </Route>
    <Route path="/editor">
        <Editor id={docId} title={docTitle} content={docContents} document={doc} />
    </Route>
    </BrowserRouter>

  );
}

export default App;
