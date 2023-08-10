import axios from 'axios';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, createContext, lazy, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';

import Header from './components/Header';
import Home from './components/Home';
import Loading from './components/Loading';
import API from './API';

const Login = lazy(() => import('./components/Login'));
const SignUp = lazy(() => import('./components/SignUp'));
const ViewPost = lazy(() => import('./components/ViewPost'));
const EditPost = lazy(() => import('./components/EditPost'));

export const UserContext = createContext(null);

function App() {

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cookies] = useCookies(['XSRF-TOKEN']);

  const httpClient = axios.create({
    headers: { 'X-XSRF-TOKEN': cookies['XSRF-TOKEN'] }
  });

  // get user authentication
  const getUser = () => {
    setIsLoading(true);
    httpClient.get(API.USER)
      .then(response => setUser(response.data || null))
      .catch(error => console.error(error))
      .finally(() => setIsLoading(false));
  };

  const logout = () => {
    setIsLoading(true);
    httpClient.post(API.LOGOUT)
      .then(() => {
        setUser(null);
        setIsLoading(false);
      })
      .catch(error => console.error(error));
  }

  const isSessionExpired = () => {
    return new Promise((resolve, reject) => {
      httpClient.get(API.SESSION_EXPIRED)
        .then(response => resolve(response.data))
        .catch(error => console.error(error));
    });
  };

  useEffect(() => {
    getUser();
  }, []);

  if (isLoading) {
    return (
      <Loading />
    );
  }

  return (
    <UserContext.Provider value={{ user, httpClient, isSessionExpired, logout }}>
      <BrowserRouter>
        <Header logout={logout} />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login getUser={getUser} />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/viewPost/:id" element={<ViewPost />} />
            <Route path="/editPost" element={<EditPost />} />
            <Route path="/editPost/:id" element={<EditPost />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </UserContext.Provider>
  );

}

export default App;
