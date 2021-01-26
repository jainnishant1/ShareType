import React, { useEffect, useState } from 'react';
const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const Socket = ()=>{
    useEffect(()=>{
        const socket = io()
        socket.on('connect',()=>{
            console.log('a user connected')
        })
        socket.on('disconnect',()=>{
            console.log('a user disconnected')
        })
        socket.on('chat message',(msg)=>{
            console.log('message: ',msg);
            socket.emit('cmd',{foo:123});
        })
    })
}

export default Socket