import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import FAQ from "./pages/FAQ";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import NewUser from "./pages/NewUser";
import NewAdmin from "./pages/NewAdmin";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import AdminDash from "./pages/AdminDash";
import MatchVolunteers from "./pages/MatchVolunteers";
import EventSearch from "./pages/EventSearch";
import Volunteerhistory from "./pages/Volunteerhistory";
import EventManagement from "./pages/EventManagement";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/newuser" element={<NewUser />} />
        <Route path="/newadmin" element={<NewAdmin />} />
        <Route path="/dashboard" element={<VolunteerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDash />} />
        <Route path="/match-volunteers" element={<MatchVolunteers />} />
        <Route path="/volunteer-history" element={<Volunteerhistory />} />
        <Route path="/event-management" element={<EventManagement />} />
        <Route path="/eventsearch" element={<EventSearch />} />
      </Routes>
    </Router>
  );
}

export default App;