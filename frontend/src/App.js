import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Login from './pages/Login';
import Locations from './pages/Locations';
import Profile from './pages/Profile';
import Training from './pages/Training';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Main />
            </Router>
        </AuthProvider>
    );
}

const Main = () => {
    const { user } = useAuth();

    return (
        <>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={user ? <ProtectedRoutes /> : <Navigate to="/login" />} />
            </Routes>
            {user && <BottomNav />}
        </>
    );
};

const ProtectedRoutes = () => (
    <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/training" element={<Training />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
);

export default App;
