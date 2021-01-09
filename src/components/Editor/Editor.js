import React, { Component } from 'react';
import { render } from 'react-dom';
import { withStyles } from '@material-ui/styles'
import MuiButton from '@material-ui/core/Button'
import RichTextEditor from './RichTextEditor'
import './style.css';

const Button = withStyles({
    root: {
        color: "#646464",
        marginTop: "1em"
    }
})(MuiButton)

export default class Editor extends Component {
    constructor() {
        super();
        this.state = {
            content: {},
            log: ''
        };

        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(content) {
        this.setState({ content })
    }

    render() {

        return (
            <div>
                <RichTextEditor onChange={this.handleChange} />
                {/* <Button onClick={() => {
                    this.setState({ log: JSON.stringify(this.state.content) })
                    console.log(this.state.content)
                }}>Log content</Button>
                <div>{this.state.log.length > 0 && <><p>The content would be saved as follows.</p><code>{this.state.log}</code></>}</div> */}
            </div>
        );
    }
}