import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import '@fortawesome/fontawesome-free/css/all.min.css';
import ColorModeProvider from './context/ThemeProvider';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchResults from './screens/SearchResults';
import SearchBar from './components/SearchBar';
import Home from './screens/Home';
import Movies from './screens/Movies';
import People from './screens/People';
import Groups from './screens/Groups';
import Reviews from './screens/Reviews';
import Settings from './screens/Settings';
import User from './screens/User';
import MoviePage from './screens/MoviePage';
import Signin from './screens/Signin';
import PersonPage from './screens/PersonPage';
import PageLayout from './layout/PageLayout';
import NotFoundPage from './screens/NotFoundPage';
import GroupPage from './screens/GroupPage';

export default function App() {

  return (
    <ColorModeProvider>
      <BrowserRouter>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Header />
          <Box component='main' sx={{ flexGrow: 1 }}>
            <SearchBar />
            <Routes>
              <Route path="/home" element={
                <PageLayout>
                  <Home />
                </PageLayout>
              } />

              <Route
                path="/search"
                element={
                  <PageLayout>
                    <SearchResults />
                  </PageLayout>
                }
              />

              <Route path="/movies" element={
                <PageLayout>
                  <Movies />
                </PageLayout>
              } />

              <Route path="/people" element={
                <PageLayout>
                  <People />
                </PageLayout>
              } />

              <Route path="/groups" element={
                <PageLayout>
                  <Groups />
                </PageLayout>
              } />

              <Route path="/group/:id" element={
                <PageLayout>
                  <GroupPage />
                </PageLayout>
              } />

              <Route path="/reviews" element={
                <PageLayout>
                  <Reviews />
                </PageLayout>
              } />

              <Route path="/settings" element={
                <PageLayout>
                  <Settings />
                </PageLayout>
              } />

              <Route path="/user" element={
                <PageLayout>
                  <User />
                </PageLayout>
              } />

              <Route path="/signin" element={
                <PageLayout>
                  <Signin />
                </PageLayout>
              } />

              {/* PERSON PAGE */}
              <Route path="/person/:id" element={
                <PageLayout>
                  <PersonPage />
                </PageLayout>
              } />

              {/* MOVIE PAGE – TÄYSILEVEÄ */}
              <Route path="/movie/:id" element={
                <PageLayout fullWidth>
                  <MoviePage />
                </PageLayout>
              } />

              {/* Not found page */}
              <Route path="*" element={
                <PageLayout>
                  <NotFoundPage></NotFoundPage>
                </PageLayout>
              } />

            </Routes>
          </Box>
          <Footer />
        </Box>
      </BrowserRouter>
    </ColorModeProvider>
  );
}