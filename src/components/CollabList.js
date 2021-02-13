import React, { useState } from 'react'
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PeopleIcon from '@material-ui/icons/People';
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import PersonIcon from '@material-ui/icons/Person';
import AddIcon from '@material-ui/icons/Add';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { blue } from '@material-ui/core/colors';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';
import DropDownMenu from 'material-ui/DropDownMenu';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import io from 'socket.io-client'
import MenuToggler from './MenuToggler'


const emails = ['username@gmail.com', 'user02@gmail.com'];
const socket = io('http://localhost:5000');
const useStyles = makeStyles({
    avatar: {
        backgroundColor: blue[100],
        color: blue[600],
    },
    root: {
        width: '420px',
        marginLeft: '25px',
    },
    listItem: {
        height: "90%"
    }
});

function SimpleDialog(props) {
    const classes = useStyles();
    const { onClose, selectedValue, open } = props;
    const user = JSON.parse(localStorage.getItem("user"))
    const [shareId, setShareId] = React.useState('')
    const [error, setError] = useState(false)
    const userList = React.useRef([])
    const access = React.useRef("edit")
    const [change, setChange] = useState(false)
    const changeRef = React.useRef(false)
    let updateToggle = false


    const handleClose = () => {
        onClose(selectedValue);
        // setShareId('')
    };

    const handleListItemClick = (value) => {
        onClose(value);
    };

    const updateId = (e) => {
        setShareId(e.target.value)
    }

    const accessToggler = (val) => {
        if (val == 2) {
            access.current = "view"
        }
        else if (val == 1) {
            access.current = "edit"
        }
    }

    const accessHandler = (val, member) => {
        // console.log(member)
        if (member.accessState) {
            if (val == 1) {
                member.accessState = "edit"
            }
            if (val == 2) {
                member.accessState = "view"
            }
        }
        setChange(false)
        // changeRef.current = false
        userList.current.forEach((indivisual) => {
            if (indivisual.accessState && indivisual.accessState !== indivisual.access) {
                setChange(true)
                // changeRef.current = true
            }
        })
    }

    const updateDocDetails = () => {

    }

    const saveAccess = (e) => {
        e.preventDefault();
        // // console.log(userList)
        // if (change) {
        //     const last = userList.current.length - 1
        //     userList.current.forEach((member,index) => {
        //         // console.log(member)
        //         if (member.accessState && member.accessState != member.access) {
        //             fetch('http://localhost:5000/updateAccess', {
        //                 method: 'POST',
        //                 headers: {
        //                     'Content-Type': 'application/json; charset=utf-8',
        //                     "Authorization": "Bearer " + localStorage.getItem("jwt")
        //                 },
        //                 credentials: 'same-origin',
        //                 mode: 'cors',
        //                 body: JSON.stringify({
        //                     docId: props.document._id,
        //                     id: member._id,
        //                     access: member.accessState
        //                 }),
        //             }).then((resp) => {
        //                 if (resp.json().success == true) {
        //                     console.log(`User Permisiions successfully changed`)
        //                     if(index==last){
        //                         getList()
        //                         handleClose()
        //                         setChange(false)
        //                     }
        //                 } else {
        //                     setError(true)
        //                 }
        //             }).catch((err) => {
        //                 console.log(`Error in collaborating: ${err}`);
        //                 setError(true)
        //             });
        //         }
        //     })
        // }
        updateToggle = true
        fetch('http://localhost:5000/updateAccess', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            credentials: 'same-origin',
            mode: 'cors',
            body: JSON.stringify({
                docId: props.document._id,
                members: userList.current
            }),
        }).then((response) => {
            return response.json();
        }).then((resp) => {
            if (resp.success == true) {
                console.log(`User Permisiions successfully changed`)
                getList()
                handleClose()
                // setChange(false)
                // changeRef.current = false
            } else {
                setError(true)
            }
        }).catch((err) => {
            console.log(`Error in collaborating: ${err}`);
            setError(true)
        });

    }

    const save = (e) => {
        e.preventDefault()
        fetch('http://localhost:5000/saveDocument', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            credentials: 'same-origin',
            mode: 'cors',
            body: JSON.stringify({
                id: props.id,
                content: props.content
            }),
        }).then((response) => {
            return response.json();
        })
            .then((resp) => {
                if (resp.success == true) {
                    console.log("Document Saved")
                    saveAccess(e)
                } else {
                    console.log("Problem in Saving Document")
                }
            })
            .catch((err) => {
                console.log(`Error in Saving Document: ${err}`);
                setError(true)
            });
    }

    const addCollaborator = (e) => {
        e.preventDefault()
        // console.log(props.document.)
        fetch('http://localhost:5000/addCollaborator', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            credentials: 'same-origin',
            mode: 'cors',
            body: JSON.stringify({
                id: shareId,
                access: access.current,
                docId: props.document._id
            }),
        }).then((response) => {
            return response.json();
        }).then((resp) => {
            if (resp.success == true) {
                console.log(`User successfully added as ${access.current}or`)
                getList()
                handleClose()
            } else {
                setError(true)
            }
        }).catch((err) => {
            console.log(`Error in collaborating: ${err}`);
            setError(true)
        });
    }
    const getList = () => {
        fetch('http://localhost:5000/getList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            credentials: 'same-origin',
            mode: 'cors',
            body: JSON.stringify({
                docId: props.document._id
            }),
        }).then((response) => {
            return response.json();
        }).then((resp) => {
            if (resp.success == true) {
                // console.log(`User successfully added as ${access.current}or`)
                userList.current = resp.members
                console.log("hi")
                userList.current.forEach((member) => {
                    member.accessState = member.access
                    // if(member.access=="edit")
                    // member.accessState = "edit";
                    // if(member.access=="view")
                    // member.accessState = 2;
                })
                if (updateToggle) {
                    socket.emit('updateAccess', { id: props.document._id, members: userList.current, content: props.document.content[props.document.content.length - 1].text })
                }
                // console.log(userList.current)
            } else {
                setError(true)
            }
        }).catch((err) => {
            console.log(`Error in collaborating: ${err}`);
            setError(true)
        });
    }

    React.useEffect(() => {
        // console.log(props.content)
        // console.log("hi")
        getList()
    }, [])

    return (
        <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open} >
            <DialogTitle id="simple-dialog-title" style={{ "width": "600px" }}>Share with other people</DialogTitle>
            <Grid container alignItems="center" >
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Add Ids of other people"
                    type="email"
                    className={classes.root}
                    onChange={(e) => { updateId(e) }}
                />
                <MenuToggler changeAccess={(val) => { accessToggler(val) }} />
            </Grid>
            {shareId.length == 0 ?
                <>
                    <List>
                        {userList.current.map((email) => (
                            <ListItem button key={email} className={classes.listItem}>
                                {/* <ListItemAvatar>
                            <Avatar className={classes.avatar}>
                                <PersonIcon />
                            </Avatar>
                        </ListItemAvatar> */}
                                <ListItemText primary={email.username} style={{ "width": "65%", "marginLeft": "10px" }} />

                                {email._id === props.document.owner._id ?
                                    <ListItemText >Owner</ListItemText>
                                    : <ListItemText >{email.access == "edit" ? <MenuToggler val={1} changeAccess={(val) => { accessHandler(val, email) }} /> : <MenuToggler val={2} changeAccess={(val) => { accessHandler(val, email) }} />}</ListItemText>}

                            </ListItem>
                        ))}
                    </List>
                    {change ?
                        <Button type="submit"
                            variant="contained"
                            style={{ "marginLeft": "80%", "marginBottom": "2%", "maxWidth": "10px" }}
                            color="primary"
                            onClick={e => { save(e) }}
                        >Save</Button> : null}
                </> : <>
                    <Button
                        type="submit"
                        variant="contained"
                        style={{ "marginLeft": "80%", "marginTop": "8%", "marginBottom": "2%", "maxWidth": "10px" }}
                        color="primary"
                        onClick={e => { addCollaborator(e) }}
                    >Share</Button></>}
        </Dialog>
    );
}

SimpleDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    selectedValue: PropTypes.string.isRequired,
};

const CollabList = (props) => {
    const [open, setOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState(emails[1]);
    const user = JSON.parse(localStorage.getItem("user"))
    const [error, setError] = useState(false)


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (value) => {
        setOpen(false);
        setSelectedValue(value);
    };

    const save = (e) => {
        e.preventDefault()
        fetch('http://localhost:5000/saveDocument', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            credentials: 'same-origin',
            mode: 'cors',
            body: JSON.stringify({
                id: props.id,
                content: props.content
            }),
        }).then((response) => {
            return response.json();
        })
            .then((resp) => {
                if (resp.success == true) {
                    console.log("Document Saved")
                } else {
                    console.log("Problem in Saving Document")
                }
            })
            .catch((err) => {
                console.log(`Error in Saving Document: ${err}`);
                setError(true)
            });
    }


    return (
        <>
            <Button
                type="submit"
                color="primary"
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={handleClickOpen}
            >Share</Button>
            <Button
                type="submit"

                onClick={e => { save(e) }}
            >Save</Button>
            <SimpleDialog selectedValue={selectedValue} open={open} onClose={handleClose} document={props.list} id={props.id} content={props.content} />
        </>
    )
}

export default CollabList