import React, { useState, useEffect,useRef } from 'react';
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CollabForm from './CollabForm'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider';
import NewDocForm from './NewDocForm'
import RefreshIcon from '@material-ui/icons/Refresh';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import io from 'socket.io-client'
const socket = io('http://localhost:5000');

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        width: '100%',
        alignItems: 'center',
        marginLeft:"2px"
    },
    demo: {
        width: '100%',
    },
    title: {
        margin: theme.spacing(4, 0, 2),
    },
    submit: {
        marginRight: theme.spacing(2),
        marginTop: theme.spacing(2)
    }
}));

export default function DocScreen(props) {
    const classes = useStyles();
    const history = useHistory();
    const [dense, setDense] = React.useState(true);
    const [secondary, setSecondary] = React.useState(false);
    
    const [error, setError] = useState(false)
    const docs = useRef([])
    const [share, setShare] = useState([])
    const [coll, setColl] = useState(false)
    const [newDoc,setNewDoc] = useState(false)

    

    const shareToggler = (e, index) => {
        e.preventDefault()
        let newArray = [...share]
        if (newArray[index] === false) {
            newArray[index] = true;
        }
        else {
            newArray[index] = false;
        }
        setShare(newArray)
    }
    const collabToggler = (e) => {
        e.preventDefault()
        setColl(!coll)
    }

    const newDocToggler = ()=>{
        // console.log(docs)
        setNewDoc(!newDoc)
    }

    const getMyCollabDocs = () => {
        fetch('http://localhost:5000/myCollabDocs', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            credentials: 'same-origin',
            mode: 'cors',
        }).then((response) => {
            return response.json();
        }).then((resp) => {
            if (resp.success == true) {
                let docList = [...resp.documents]
                docList.forEach((singleDoc) => {
                    singleDoc.isOwner = false
                })
                let newArray = [...docs.current,...docList]
                let Share = new Array(newArray.length)
                Share.fill(false)
                docs.current=newArray
                setShare(Share)
            } else {
                setError(true)
            }
        }).catch((err) => {
            console.log(`Error in retrieveing my collabed Documents: ${err}`);
            setError(true)
        });
    }

    const getMyOwnedDocs = () => {
        // e.preventDefault()
        fetch('http://localhost:5000/myOwnedDocs', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            credentials: 'same-origin',
            mode: 'cors',
        }).then((response) => {
            // console.log(response)
            return response.json();
        }).then((resp) => {
            if (resp.success == true) {
                let newArray = new Array(resp.documents.length)
                newArray.fill(false)
                let docList = [...resp.documents]
                docList.forEach((singleDoc) => {
                    singleDoc.isOwner = true
                })
                docs.current=docList
                setShare(newArray)
                getMyCollabDocs()
            } else {
                setError(true)
            }
        }).catch((err) => {
            console.log(`Error in retrieveing my owned Documents: ${err}`);
            setError(true)
        });
    }

    const deleteDocument = (e,id)=>{
        e.preventDefault()
        fetch('http://localhost:5000/deleteDocument', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            credentials: 'same-origin',
            mode: 'cors',
            body: JSON.stringify({
                id,
            }),
        }).then((response) => {
            // console.log(response)
            return response.json();
        }).then((resp) => {
            if (resp.success == true) {
                getMyOwnedDocs()
            } else {
                setError(true)
            }
        }).catch((err) => {
            console.log(`Error in deleting: ${err}`);
            setError(true)
        });
    }

    const logout = (e) => {
        e.preventDefault()
        fetch('http://localhost:5000/logout', {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            credentials: 'same-origin',
            mode: 'cors',
        }).then((response) => {
            // console.log(response)
            return response.json();
        })
            .then((resp) => {
                if (resp.success == true) {
                    // props.toLogin();
                    localStorage.clear()
                    history.push('/')
                } else {
                    setError(true)
                }
            })
            .catch((err) => {
                console.log(`Error in Logging Out: ${err}`);
                setError(true)
            });
    }
    const editHandler = (e,id,title,content,document)=>{
        e.preventDefault()
        localStorage.setItem("document", JSON.stringify(document))
        if(content.length==0){
            props.update(id,title,null,document)
        }
        else{
            props.update(id,title,content[content.length-1].text,document)
        }
        history.push('/editor')
    }

    useEffect(() => {
        getMyOwnedDocs();
    }, [])

    return (
        <div className={classes.root}>
            <Grid container justify="flex-end">
                <Button
                    type="submit"
                    variant="contained"
                    className={classes.submit}
                    onClick={e => { logout(e) }}
                >Logout</Button>
            </Grid>
            <Grid style={{ "width": "100%", "alignItems": "center" }}>
                <Grid item xs={20} md={10}>
                    <Typography variant="h6" className={classes.title}>
                        <b>My Documents</b><IconButton> 
                            <RefreshIcon style={{ "fontSize": "large" }} onClick={getMyOwnedDocs} />
                            </IconButton>
          </Typography>
                    <div className={classes.demo}>
                        <List dense={dense}>
                            {docs.current.map((doc, val) => (
                                <>
                                    <ListItem style={{ "margin": "5px 0" }}>
                                        <ListItemText
                                            secondary={secondary ? 'Secondary text' : null}
                                            style={{ "width": "5px" }}>{doc.title}</ListItemText>
                                        <ListItemText
                                            secondary={secondary ? 'Secondary text' : null}
                                        >{doc.isOwner ? <>Owner</> : <>Collaborator</>}</ListItemText>
                                        <ListItemSecondaryAction >
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                style={{ "marginRight": "6px", "maxHeight": "30px", "maxWidth": "10px" }}
                                                onClick={(e) => { shareToggler(e, val) }}
                                            >Share</Button>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                style={{ "marginRight": "2px", "maxHeight": "30px", "maxWidth": "10px" }}
                                                onClick={(e)=>{editHandler(e,doc._id,doc.title,doc.content,doc)}}
                                            >Edit</Button>
                                            <IconButton edge="end" aria-label="delete">
                                                {doc.isOwner ? <DeleteIcon onClick={e => { deleteDocument(e,doc._id) }} /> : <DeleteIcon />}
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    {share[val] ?
                                        <ListItem style={{
                                            "backgroundColor": "#eeeeee",
                                            "margin": "5px 5px 5px 0px",
                                            "borderRadius": "5px"
                                        }}>
                                            <ListItemText
                                                secondary={secondary ? 'Secondary text' : null}
                                            ><b>Id:</b> <i>{doc._id}</i></ListItemText>
                                        </ListItem>
                                        : null}
                                    <Divider />
                                </>
                            ))}
                            {newDoc?
                            <NewDocForm toggle={(e)=>{newDocToggler(e)}} refresh={getMyOwnedDocs}/>
                            :
                            <div>
                            {coll ?
                                <CollabForm toggle={(e) => { collabToggler(e) }} refresh={getMyOwnedDocs}/>
                                :
                                <Grid container justify="flex-end">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    style={{ "marginRight": "4px", "maxHeight": "30px", "width": "105px", "marginTop": "14px" }}
                                                onClick={(e) => { newDocToggler(e) }}
                                >New</Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    style={{ "marginRight": "4px", "maxHeight": "30px", "marginTop": "14px", "marginRight": "20px" }}
                                    color="primary"
                                    onClick={(e) => { collabToggler(e) }}
                                >Collaborte</Button>
                            </Grid>}
                            </div>
                            }
                        </List>
                    </div>

                </Grid>
            </Grid>
        </div>
    );
}
