import React, { useState, useEffect,useRef } from 'react';
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CollabForm from './CollabForm'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        width: '100%',
        alignItems: 'center',
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

export default function DocScreen() {
    const classes = useStyles();
    const history = useHistory();
    const [dense, setDense] = React.useState(true);
    const [secondary, setSecondary] = React.useState(false);
    
    const [error, setError] = useState(false)
    const docs = useRef([])
    const [collDoc,setCollDoc] = useState([])
    const [share, setShare] = useState([])
    const [coll, setColl] = useState(false)

    

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

    const openNewDoc = (e)=>{
        e.preventDefault()
        history.push('/editor')
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
                        My Documents
          </Typography>
                    <div className={classes.demo}>
                        <List dense={dense}>
                            {docs.current.map((doc, val) => (
                                <>
                                    <ListItem style={{ "margin": "5px 0" }}>
                                        <ListItemText
                                            secondary={secondary ? 'Secondary text' : null}
                                        >{doc.title}</ListItemText>
                                        <ListItemText
                                            secondary={secondary ? 'Secondary text' : null}
                                        >{doc.isOwner ? <>Owner</> : <>Collaborator</>}</ListItemText>
                                        <ListItemSecondaryAction >
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                style={{ "marginRight": "4px", "maxHeight": "30px", "maxWidth": "10px" }}
                                                onClick={(e) => { shareToggler(e, val) }}
                                            >Share</Button>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                style={{ "marginRight": "4px", "maxHeight": "30px", "maxWidth": "10px" }}
                                            >Edit</Button>
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
                            {coll ?
                                <CollabForm toogle={(e) => { collabToggler(e) }}/>
                                :
                                <Grid container justify="flex-end">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    style={{ "marginRight": "4px", "maxHeight": "30px", "width": "105px", "marginTop": "14px" }}
                                        onClick={(e) => { openNewDoc(e) }}
                                >New</Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    style={{ "marginRight": "4px", "maxHeight": "30px", "marginTop": "14px", "marginRight": "20px" }}
                                    color="primary"
                                    onClick={(e) => { collabToggler(e) }}
                                >Collaborte</Button>
                            </Grid>}
                        </List>
                    </div>

                </Grid>
            </Grid>
        </div>
    );
}
