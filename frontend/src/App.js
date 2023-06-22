import axios from 'axios'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createContext, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';

import Header from './components/Header'
import Home from './components/Home'
import Login from './components/Login'
import SignUp from './components/SignUp'
import ViewPost from './components/ViewPost'
import EditPost from './components/EditPost'

export const UserContext = createContext(null);

function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cookies] = useCookies(['XSRF-TOKEN']);

  const httpClient = axios.create({
    headers: { 'X-XSRF-TOKEN': cookies['XSRF-TOKEN'] }
  });

  const getUser = () => {
    httpClient.get('/api/user')
      .then(response => setUser(response.data))
      .catch(error => {
        console.error(error);
        setUser(null);
      });
  };

  useEffect(() => {
    setLoading(true);
    getUser();
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="spinner-border text-primary">
        <span className="visually-hidden">Loading...</span>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, getUser, httpClient }}>
      <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/viewPost/:id" element={<ViewPost />} />
          <Route path="/editPost" element={<EditPost />} />
          <Route path="/editPost/:id" element={<EditPost />} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
