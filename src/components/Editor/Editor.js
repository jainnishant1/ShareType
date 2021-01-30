import React, { useState, useRef, useEffect } from 'react'
import { render } from 'react-dom';
import { withStyles } from '@material-ui/styles'
import MuiButton from '@material-ui/core/Button'
import RichTextEditor from 'react-rte'
import { useHistory } from 'react-router-dom'
import Grid from '@material-ui/core/Grid';
import styled from '@emotion/styled'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import FormatBold from '@material-ui/icons/FormatBold'
import FormatItalic from '@material-ui/icons/FormatItalic'
import FormatTitle from '@material-ui/icons/FormatSize'
import FormatUnderlined from '@material-ui/icons/FormatUnderlined'
import FormatColor from '@material-ui/icons/Palette'
import io from 'socket.io-client'
import ExitToAppTwoToneIcon from '@material-ui/icons/ExitToAppTwoTone';
import CollabList from '../CollabList'

const Editor = (props) => {
    const history = useHistory();
    const [error, setError] = useState(false)
    const backToggler = useRef(false)
    const logToggler = useRef(false)
    const [editorContent, setEditorContent] = useState(RichTextEditor.createEmptyValue());


    const changeHandler = (editorContent) => {
        setEditorContent(editorContent);
    };

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
            return response.json();
        })
            .then((resp) => {
                if (resp.success == true) {
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
                content: editorContent.toString('html')
            }),
        }).then((response) => {
            return response.json();
        })
            .then((resp) => {
                if (resp.success == true) {
                    console.log("Document Saved")
                    if (logToggler.current)
                        history.push('/')
                    if (backToggler.current)
                        history.push('/docScreen')
                } else {
                    console.log("Problem in Saving Document")
                }
            })
            .catch((err) => {
                console.log(`Error in Saving Document: ${err}`);
                setError(true)
            });
    }
    const back = (e) => {
        e.preventDefault()
        backToggler.current = !backToggler.current
        if (props.content !== editorContent.toString('html')) {
            save(e)
        }
        else {
            history.push('/docScreen')
        }
    }

    const logHandler = (e) => {
        e.preventDefault()
        logToggler.current = !logToggler.current
        if (props.content !== editorContent.toString('html')) {
            save(e)
        }
        else {
            history.push('/')
        }
    }

    useEffect(() => {
        console.log(props)
        if (props.content) {
            setEditorContent(RichTextEditor.createValueFromString(props.content, 'html'))
        }

        // const socket = io('http://localhost:5000');
        // socket.on('connect', () => { console.log('ws connect'); });
        // socket.on('disconnect', () => { console.log('ws disconnect'); });
        // socket.emit('msg', 'Does this work?');
        // socket.on('msg', (data) => {
        //     console.log('ws msg:', data);
        //     socket.emit('cmd', { foo: 123 });
        // });
    }, [])

    return <>
        <Grid container justify="flex-end">
            <CollabList list={props.document}/>
            <Button
                type="submit"

                onClick={e => { back(e) }}
            >Back</Button>
            <Button
                type="submit"

                onClick={e => { save(e) }}
            >Save</Button>
            <Button
                type="submit"

                onClick={e => { logHandler(e) }}
            >Logout</Button>
        </Grid>
        <RichTextEditor value={editorContent} onChange={changeHandler} />
    </>;
};

export default Editor;