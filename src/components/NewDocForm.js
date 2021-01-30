import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            // margin: theme.spacing(1),
            width: '40ch',
            backgroundColor: 'white',
            marginLeft: theme.spacing(1.5),
            marginTop: theme.spacing(1)
        },
    },
    input: {
        backgroundColor: 'white'
    }
}));



const NewDocForm = (props) => {
    const classes = useStyles();
    const history = useHistory();
    const [docTitle, setDocTitle] = useState('')
    const [secondary, setSecondary] = React.useState(false);
    const [error, setError] = useState(false)

    const DocTitleHandler = (e) => {
        setDocTitle(e.target.value)
    }
    const createNewDoc = (e) => {
        e.preventDefault()
        // history.push('/editor')
        props.toggle(e)
        fetch('http://localhost:5000/createDocument', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            credentials: 'same-origin',
            mode: 'cors',
            body: JSON.stringify({
                title:docTitle,
            }),
        }).then((response) => {
            // console.log(response)
            return response.json();
        }).then((resp) => {
            if (resp.success == true) {
                props.refresh()
            } else {
                setError(true)
            }
        }).catch((err) => {
            console.log(`Error in creating a New Document: ${err}`);
            setError(true)
        });
    }

    return (
        <div style={{ "borderRadius": "10px", "backgroundColor": "#eeeeee", "marginTop": "14px" }}>
            <TextField
                variant="outlined"
                fullWidth
                required
                id="id"
                label="Title of your doc"
                name="id"
                autoComplete="id"
                className={classes.root}
                onChange={e => { DocTitleHandler(e) }}
            />
            <Grid container justify="flex-end">
                <Button
                    type="submit"
                    variant="contained"
                    style={{ "marginRight": "8px", "maxHeight": "30px", "width": "105px", "marginTop": "14px", "marginBottom": "14px" }}
                    onClick={(e)=>{props.toggle(e)}}
                >Cancel</Button>
                <Button
                    type="submit"
                    variant="contained"
                    style={{ "marginRight": "8px", "maxHeight": "30px", "marginTop": "14px", "marginBottom": "14px" }}
                    color="primary"
                    onClick={(e) => { createNewDoc(e) }}
                >Create</Button>
            </Grid>
        </div>
    )
}

export default NewDocForm