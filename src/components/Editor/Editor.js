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
import CollabList from '../CollabList'
import LiveList from '../LiveList'

const socket = io('http://localhost:5000');

const Editor = (props) => {
    const history = useHistory();
    const user = JSON.parse(localStorage.getItem("user"))
    const [error, setError] = useState(false)
    const backToggler = useRef(false)
    const logToggler = useRef(false)
    const [editorContent, setEditorContent] = useState(RichTextEditor.createEmptyValue());
    const currentDoc = JSON.parse(localStorage.getItem("document"))
    const updateAccess = React.useRef([])


    const changeHandler = (editorContent) => {
        if (props.document.owner._id == user._id) {
            setEditorContent(editorContent);
            socket.emit('edit', { id: props.document._id, content: editorContent.toString('html') })
            return
        }
        else if (updateAccess.current.length > 0) {
            updateAccess.current.forEach((member) => {
                if (member._id == user._id && member.access != "view") {
                    setEditorContent(editorContent);
                    socket.emit('edit', { id: props.document._id, content: editorContent.toString('html') })
                    return
                }
            })
        }
        else {
            props.document.memberList.forEach((member) => {
                if (member._id == user._id && member.access != "view") {
                    setEditorContent(editorContent);
                    // edit.current = editorContent;
                    socket.emit('edit', { id: props.document._id, content: editorContent.toString('html') })
                    return
                }
            })
        }

    };

    const logout = () => {
        // e.preventDefault()
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
                        logout()
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
        localStorage.removeItem("document")
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
            logout()
        }
    }

    useEffect(() => {
        // console.log(props)
        // console.log(props.document)
        if(currentDoc.content.length!=0&&currentDoc.content[currentDoc.content.length-1].text){
            setEditorContent(RichTextEditor.createValueFromString(currentDoc.content[currentDoc.content.length - 1].text, 'html'))
        }

        socket.on('connect', () => { console.log('ws connect'); });
        socket.on('disconnect', () => { console.log('ws disconnect'); });
        socket.emit('joinSocket', { id: props.document._id, user: JSON.parse(localStorage.getItem("user")) })

        socket.on('edit', (data) => {
            setEditorContent(RichTextEditor.createValueFromString(data.content, 'html'))
        })

        socket.on('updateAccess', (data) => {
            // setUpdateAccess(data.members)
            updateAccess.current = data.members
            console.log(data.content)
            setEditorContent(RichTextEditor.createValueFromString(data.content, 'html'))
            // changeHandler(editorContent)
        })

        return () => {
            socket.emit('leaveSocket', { id: props.document._id, user: user })
        }
    }, [])

    return <>
        <Grid container justify="flex-end">
            <LiveList list={props.document} />
            {user._id == props.document.owner._id ?
                <CollabList list={props.document} id={props.id} content={editorContent.toString('html')} /> : null}
            <Button
                type="submit"

                onClick={e => { back(e) }}
            >Back</Button>
            <Button
                type="submit"

                onClick={e => { logHandler(e) }}
            >Logout</Button>
        </Grid>
        <RichTextEditor value={editorContent} onChange={changeHandler} />
    </>;
};

export default Editor;