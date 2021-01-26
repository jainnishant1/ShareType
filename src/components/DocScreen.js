import React,{useState} from 'react';
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        // margin: theme.spacing(0, 3, 2),
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1)
    },
}));



const DocScreen = (props)=>{
    const classes = useStyles();
    const [error, setError] = useState(false)

    const logout = (e) => {
        e.preventDefault()
        fetch('http://localhost:5000/logout', {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            credentials: 'same-origin',
            mode: 'cors',
        }).then((response) => {
            // console.log(response)
            return response.json();
        })
            .then((resp) => {
                if (resp.success == true) {
                    props.toLogin();
                } else {
                    setError(true)
                }
            })
            .catch((err) => {
                console.log(`Error in Logging Out: ${err}`);
                setError(true)
            });
    }

    return(
        <div>
            <Grid container justify="flex-end">
                <Button 
                    type="submit"
                    variant="contained"
                    className={classes.submit} 
                    onClick={e => { logout(e) }} >Logout</Button>
            </Grid>
        </div>
    )
}

export default DocScreen