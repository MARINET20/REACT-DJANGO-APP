import React, {useState} from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Header from "./layout/Header";
import HomePage from "./HomePage";
import FirstPage from "./layout/FirstPage";
import StudentsPage from "./StudentsPage";
import SearchTeamPage from "./pages/SearchTeamPage";
import CreateDiscipline from './CreateDiscipline';
import NextPageSearchTeam from "./pages/NextPageSearchTeam";
import LoginPage from "./LoginPage";
import Profile from "./ProfilePage";
import Registration from "./Registartion";
import CreateProject from "./CreateProject";
import CreateUserPage from "./pages/user/CreateUserPage";
import EditProjectPage from "./pages/EditProjectPage";
import EditUserPage from "./pages/EditUserPage";
import ProjectPage from "./ProjectPage";
import PrivateRoute from "./PrivateRoute";




function App() {
    const [searchValue, setSearchValue] = useState("");
    return (
        <Router>
            <AuthProvider>
                <Header searchValue={searchValue} setSearchValue={setSearchValue}/>
                <Routes>
                    <Route path="/" element={<FirstPage />} />
                    <Route path="/projects" element={<HomePage searchValue={searchValue} setSearchValue={setSearchValue} />} />
                    <Route path="/students"  element={<StudentsPage searchValue={searchValue} setSearchValue={setSearchValue} />} />
                    <Route path="/search-team" element={<SearchTeamPage />} />
                    <Route path="/discipline" element={<CreateDiscipline />} />
                    <Route path="/team/:id" element={<NextPageSearchTeam />} />
                    <Route path="/project/:id" element={<ProjectPage/>} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/registration" element={<Registration />} />
                    <Route path="/create" element={<CreateProject />} />
                    <Route path="/user"  element={<CreateUserPage />} />
                    <Route path="/edit" element={<EditProjectPage />} />
                    <Route path="/edit-user" element={<EditUserPage />} />
                </Routes>
            </AuthProvider>
        </Router>    
    );
}

export default App;
