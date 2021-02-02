import React, { Component } from 'react';
import { render } from 'react-dom';
import AppBar from 'material-ui/AppBar';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Button from '@material-ui/core/Button'


class MenuToggler extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selection: this.props.val ? this.props.val : 1
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event, index, value) {
        //set selection to the value selected
        this.setState({ selection: value });
        // if (this.state.selection == 1) {
        //     // return (
        //     //     <div>Hello</div>
        //     // );
        //     console.log("1")
        //     this.props.changeAccess(1)
        // } else if (this.state.selection == 2) {
        //     // return (
        //     //     <div>Hola</div>
        //     // );
        //     console.log(2)
        //     this.props.changeAccess(2)
        // } 

    }

    pageControl() {
        if (this.state.selection == 1) {
            if(this.props.changeAccess)
            this.props.changeAccess(1)
        } else if (this.state.selection == 2) {
            if(this.props.changeAccess)
            this.props.changeAccess(2)
        } 
    }


    render() {
        return (
            <div>
                <MuiThemeProvider>
                    <DropDownMenu
                        value={this.state.selection}
                        onChange={this.handleChange}
                    >
                        <MenuItem value={1} primaryText="Editor" />
                        <MenuItem value={2} primaryText="Viewer" />
                    </DropDownMenu>
                    {this.pageControl()}
                </MuiThemeProvider>
            </div>
        );
    }
}

export default MenuToggler
