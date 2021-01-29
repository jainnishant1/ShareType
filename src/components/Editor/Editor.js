// import React, { Component } from 'react';
// import { render } from 'react-dom';
// import { withStyles } from '@material-ui/styles'
// import MuiButton from '@material-ui/core/Button'
// import RichTextEditor from './RichTextEditor'
// import './style.css';

// const Button = withStyles({
//     root: {
//         color: "#646464",
//         marginTop: "1em"
//     }
// })(MuiButton)

// export default class Editor extends Component {
//     constructor() {
//         super();
//         this.state = {
//             content: {},
//             log: ''
//         };

//         this.handleChange = this.handleChange.bind(this)
//     }

//     handleChange(content) {
//         this.setState({ content })
//     }

//     render() {

//         return (
//             <div>
//                 <RichTextEditor onChange={this.handleChange} />
//                 {/* <Button onClick={() => {
//                     this.setState({ log: JSON.stringify(this.state.content) })
//                     console.log(this.state.content)
//                 }}>Log content</Button>
//                 <div>{this.state.log.length > 0 && <><p>The content would be saved as follows.</p><code>{this.state.log}</code></>}</div> */}
//             </div>
//         );
//     }
// }

import React, { useState, useRef, useEffect } from 'react'
// import { Editor, EditorState, RichUtils, convertToRaw } from 'draft-js'
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

const BodyTextEditor = () => {
    const history = useHistory();
    const [error, setError] = useState(false)
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
        const socket = io('http://localhost:5000');
        socket.on('connect', () => { console.log('ws connect'); });
        socket.on('disconnect', () => { console.log('ws disconnect'); });
        socket.emit('msg', 'Does this work?');
        socket.on('msg', (data) => {
            console.log('ws msg:', data);
            socket.emit('cmd', { foo: 123 });
        });
    })

    return <>
        <Grid container justify="flex-end">
            <Button
                type="submit"
                
                onClick={e => { logout(e) }}
            >Logout</Button>
        </Grid>
        <RichTextEditor value={editorContent} onChange={changeHandler} />
        
    </>;
};

export default BodyTextEditor;