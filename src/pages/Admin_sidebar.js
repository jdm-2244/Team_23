import React from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Admin logged out");
    navigate("/login");
  };

  return (
    <div
      className="bg-dark text-white d-flex flex-column justify-content-between align-items-center rounded shadow-lg"
      style={{
        width: "220px",
        minHeight: "360px",
        position: "fixed",
        left: "20px",
        top: "120px",
        padding: "20px",
      }}
    >
      <ListGroup variant="flush" className="w-100 text-center">
        <ListGroup.Item className="bg-dark text-white border-0 py-2">
          <Link to="/admin-profile" className="text-decoration-none text-white fs-6">👤 Profile</Link>
        </ListGroup.Item>
        <ListGroup.Item className="bg-dark text-white border-0 py-2">
          <Link to="/eventmanagement" className="text-decoration-none text-white fs-6">📅 Create a new Event</Link>
        </ListGroup.Item>
        <ListGroup.Item className="bg-dark text-white border-0 py-2">
          <Link to="/match-volunteers" className="text-decoration-none text-white fs-6">🤝 Match Volunteers</Link>
        </ListGroup.Item>
        <ListGroup.Item className="bg-dark text-white border-0 py-2">
          <Link to="/notify-volunteers" className="text-decoration-none text-white fs-6">📢 Notify Volunteers</Link>
        </ListGroup.Item>
        <ListGroup.Item className="bg-dark text-white border-0 py-2">
          <Link to="/volunteer-history" className="text-decoration-none text-white fs-6">📜 View Volunteer History</Link>
        </ListGroup.Item>
      </ListGroup>

      <Button
        variant="danger"
        className="w-100 mt-3"
        onClick={handleLogout}
        style={{
          backgroundColor: "#dc3545",
          border: "none",
          padding: "10px 0",
          fontSize: "16px",
        }}
      >
        🚪 Log Out
      </Button>
    </div>
  );
};

export default Sidebar;