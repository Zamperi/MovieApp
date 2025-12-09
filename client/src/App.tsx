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
              <Route path="/home" element={<Home></Home>}></Route>
              <Route path="/movies" element={<Movies></Movies>} />
              <Route path="/people" element={<People />} />
              <Route path="/groups" element={<Groups />}></Route>
              <Route path="/reviews" element={<Reviews />}></Route>
              <Route path="/settings" element={<Settings />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/user" element={<User></User>} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/movie/:id" element={<MoviePage />} />
              <Route path="/person/:id" element={<PersonPage />} />
              <Route path="/" element={<Navigate to="/home" replace />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </BrowserRouter>
    </ColorModeProvider>
  );
}