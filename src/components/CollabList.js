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
import MenuToggler from './MenuToggler'


const emails = ['username@gmail.com', 'user02@gmail.com'];
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
        height:"90%"
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


    const handleClose = () => {
        onClose(selectedValue);
        setShareId('')
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
    const getList=()=>{
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
            } else {
                setError(true)
            }
        }).catch((err) => {
            console.log(`Error in collaborating: ${err}`);
            setError(true)
        });
    }

    React.useEffect(() => {
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
                                : <ListItemText >{email.access == "edit" ? <MenuToggler val={1} /> : <MenuToggler val={2} />}</ListItemText>}

                        </ListItem>
                    ))}
                </List> : <>
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


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (value) => {
        setOpen(false);
        setSelectedValue(value);
    };


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
            <SimpleDialog selectedValue={selectedValue} open={open} onClose={handleClose} document={props.list} />
        </>
    )
}

export default CollabList