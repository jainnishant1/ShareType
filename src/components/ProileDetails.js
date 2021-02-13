import React, { useEffect } from 'react'
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PeopleIcon from '@material-ui/icons/People';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import io from 'socket.io-client'

const socket = io('http://localhost:5000');

const ProfileDetails = (props) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [options, setOptions] = React.useState([])
    const copy= React.useRef(false)
    const value = React.useRef('')
    const user = JSON.parse(localStorage.getItem("user"))
    const open = Boolean(anchorEl);

    const ITEM_HEIGHT = 48;

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        setOptions([user.username,user._id])
    };

    const onChange = ({ target: { value } }) => {
        copy.current = false;
        value.current = value

    };

    const onCopy = () => {
        copy.current = true
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    return (
        <>
            <IconButton
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={handleClick}
            >
                <PeopleIcon />
            </IconButton>
            <Menu
                id="long-menu"
                anchorEl={anchorEl}
                keepMounted
                open={open}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        maxHeight: ITEM_HEIGHT * 4.5,
                        width: '30ch',
                    },
                }}
            >
                {options.map((option) => (
                    <CopyToClipboard onCopy={onCopy} text={option} >
                    <MenuItem key={option} onClick={handleClose}>
                        {option}
                    </MenuItem>
                    </CopyToClipboard>
                ))}
            </Menu>
        </>
    )
}

export default ProfileDetails