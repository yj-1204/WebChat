import { Routes, Route, Navigate } from 'react-router-dom';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import NavBar from './components/NavBar';
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { ChatContext, ChatContextProvider } from './context/ChatContext';

function App() {
    const { user } = useContext(AuthContext);
    return (
        <ChatContextProvider user ={user}>
            <NavBar />
            <Container className="text-secondary">
                <Routes>
                    <Route path="/" element={user? <Chat/>: <Navigate to="/login" />} />
                    <Route path="/register" element={user ? <Chat /> : <Register />} />
                    <Route path="/login" element={user ? <Chat /> : <Login />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Container>
        </ChatContextProvider>
    );
}

export default App;