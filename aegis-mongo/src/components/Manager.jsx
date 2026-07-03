import React, { useRef, useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import 'react-toastify/dist/ReactToastify.css';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Manager = ({ storageMode, setStorageMode }) => {
  const [form, setForm] = useState({ site: "", username: "", password: "" });
  const [passwordArray, setPasswordArray] = useState([]);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", site: "", username: "", password: "" });
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);

  const [showConnectionHelp, setShowConnectionHelp] = useState(false);

  const loadPasswords = async () => {
    if (storageMode === "local") {
      try {
        const stored = localStorage.getItem("aegis_passwords");
        if (stored) {
          setPasswordArray(JSON.parse(stored));
        } else {
          setPasswordArray([]);
        }
      } catch (error) {
        console.error("Failed to parse passwords from localStorage:", error);
        setPasswordArray([]);
      }
    } else if (storageMode === "mongo") {
      try {
        const res = await fetch(BACKEND_URL + "/");
        if (!res.ok) {
          throw new Error("HTTP error " + res.status);
        }
        const passwords = await res.json();
        setPasswordArray(passwords);
      } catch (error) {
        toast.error("Could not connect to the local MongoDB server.");
        setShowConnectionHelp(true);
      }
    }
  };

  useEffect(() => {
    loadPasswords();
  }, [storageMode]);

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (form.site.length > 3 && form.username.length > 3 && form.password.length > 3) {
      const newPassword = { ...form, id: uuidv4() };

      if (storageMode === "local") {
        const updated = [...passwordArray, newPassword];
        setPasswordArray(updated);
        localStorage.setItem("aegis_passwords", JSON.stringify(updated));
        toast.success("Password saved successfully");
        setForm({ site: "", username: "", password: "" });
      } else if (storageMode === "mongo") {
        try {
          const res = await fetch(BACKEND_URL + "/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPassword)
          });
          if (!res.ok) throw new Error("Failed to save to database");
          
          setPasswordArray([...passwordArray, newPassword]);
          toast.success("Password saved successfully");
          setForm({ site: "", username: "", password: "" });
        } catch (error) {
          toast.error("Could not connect to the local MongoDB server. Make sure the backend is running.");
        }
      }
    } else {
      toast.error("Inputs must be longer than 3 characters");
    }
  };

  const deletePassword = async (id) => {
    const shouldDelete = window.confirm("Really want to delete this password?");
    if (!shouldDelete) return;

    if (storageMode === "local") {
      const updated = passwordArray.filter(item => item.id !== id);
      setPasswordArray(updated);
      localStorage.setItem("aegis_passwords", JSON.stringify(updated));
      toast.success("Password deleted");
    } else if (storageMode === "mongo") {
      try {
        const res = await fetch(BACKEND_URL + "/", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
        });
        if (!res.ok) throw new Error("Failed to delete from database");

        setPasswordArray(passwordArray.filter(item => item.id !== id));
        toast.success("Password deleted");
      } catch (error) {
        toast.error("Could not connect to the local MongoDB server. Make sure the backend is running.");
      }
    }
  };

  const editPassword = (id) => {
    const item = passwordArray.find(i => i.id === id);
    if (item) {
      setEditForm({ ...item });
      setIsEditModalOpen(true);
    }
  };

  const saveEditedPassword = async () => {
    if (editForm.site.length > 3 && editForm.username.length > 3 && editForm.password.length > 3) {
      if (storageMode === "local") {
        const updated = passwordArray.map(item => item.id === editForm.id ? editForm : item);
        setPasswordArray(updated);
        localStorage.setItem("aegis_passwords", JSON.stringify(updated));
        toast.success("Password updated");
        setIsEditModalOpen(false);
      } else if (storageMode === "mongo") {
        try {
          // Delete old entry first as backend doesn't support PUT/PATCH
          const deleteRes = await fetch(BACKEND_URL + "/", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editForm.id })
          });
          if (!deleteRes.ok) throw new Error("Delete failed");

          const postRes = await fetch(BACKEND_URL + "/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editForm)
          });
          if (!postRes.ok) throw new Error("Post failed");

          const updated = passwordArray.map(item => item.id === editForm.id ? editForm : item);
          setPasswordArray(updated);
          toast.success("Password updated");
          setIsEditModalOpen(false);
        } catch (error) {
          toast.error("Could not connect to the local MongoDB server. Make sure the backend is running.");
        }
      }
    } else {
      toast.error("Inputs must be longer than 3 characters");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (showConnectionHelp) {
    return (
      <>
        <ToastContainer position="top-center" autoClose={3000} theme="dark" />
        <div className="container py-5" style={{ maxWidth: '600px' }}>
          <div className="card bg-dark border-secondary p-4 text-light">
            <h2 className="text-danger mb-4">Local MongoDB Connection Failed</h2>
            <p className="lead">The application could not reach the backend server at <strong>{BACKEND_URL}</strong>.</p>
            <p className="mb-3">To run Aegis in MongoDB mode, you need to ensure both the MongoDB database service and the backend API server are active. Follow these steps:</p>
            
            <ol className="ps-3 text-secondary mb-4">
              <li className="mb-4">
                <strong>Start MongoDB Database Engine (Not just Compass):</strong>
                <p className="text-light mb-1 mt-1">MongoDB Compass is only a GUI viewer. The database service itself must be running on port <code>27017</code>.</p>
                <ul className="text-secondary ps-3 mt-1" style={{ fontSize: '0.9em' }}>
                  <li className="mb-1">
                    <strong>Check Windows Services:</strong> Open the Windows Services app (search "Services" in start menu), locate <strong>MongoDB Server</strong>, and ensure its status is <strong>Running</strong>. If it is stopped, right-click and choose <strong>Start</strong>.
                  </li>
                  <li>
                    <strong>Error 2 (File Not Found) or Service Missing?</strong> If it fails to start or is missing, download and install <strong>[MongoDB Community Server (MSI)](https://www.mongodb.com/try/download/community)</strong> from the official website, ensuring you check "Install MongoD as a Service" during setup.
                  </li>
                </ul>
              </li>
              <li className="mb-3">
                <strong>Open the backend folder:</strong> Open a new terminal window and navigate to the backend folder:
                <pre className="bg-black text-white p-3 mt-2 rounded font-monospace" style={{ fontSize: '0.9em' }}>
                  cd aegis-mongo/backend
                </pre>
              </li>
              <li className="mb-3">
                <strong>Start the API server:</strong> Install dependencies (if you haven't) and start the backend:
                <pre className="bg-black text-white p-3 mt-2 rounded font-monospace" style={{ fontSize: '0.9em' }}>
                  npm install && npm start
                </pre>
              </li>
              <li className="mb-3">
                <strong>Confirm Connection:</strong> Wait for the terminal output to confirm:
                <div className="text-success font-monospace mt-1" style={{ fontSize: '0.9em' }}>
                  Example app listening on port 3000<br/>
                  Connected to MongoDB at mongodb://localhost:27017/
                </div>
              </li>
            </ol>

            <div className="d-flex gap-3">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowConnectionHelp(false);
                  loadPasswords();
                }}
              >
                Try Reconnecting
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => {
                  setShowConnectionHelp(false);
                  setStorageMode("local");
                }}
              >
                Back to Local Storage
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} theme="dark" />
      
      <div className="container py-4" style={{ maxWidth: '800px' }}>
        <h2 className="text-center mb-4">Password Manager</h2>
        <form onSubmit={savePassword} className="mb-4">
          <div className="mb-3">
            <label htmlFor="site" className="form-label">Website URL</label>
            <input
              type="text"
              className="form-control"
              id="site"
              name="site"
              value={form.site}
              onChange={handleChange}
              placeholder="Enter Website URL"
              required
            />
          </div>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter Username"
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-group">
                <input
                  type={showPasswordForm ? "text" : "password"}
                  className="form-control"
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter Password"
                  required
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  title={showPasswordForm ? "Hide password" : "Show password"}
                >
                  <img
                    src={showPasswordForm ? "/assets/off.png" : "/assets/on.png"}
                    alt={showPasswordForm ? "Hide" : "Show"}
                    width="20"
                    className="invert"
                  />
                </button>
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
            Add Password
          </button>
        </form>        <div className="passwords">
          <h3 className="h4 mb-3">Your Passwords</h3>
          {passwordArray.length === 0 ? (
            <div className="text-secondary">No passwords saved yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-striped align-middle border border-secondary table-sm">
                <thead>
                  <tr>
                    <th>Website</th>
                    <th>Username</th>
                    <th>Password</th>
                    <th className="text-center" style={{ width: '180px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {passwordArray.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <a
                          href={item.site.startsWith('http') ? item.site : `https://${item.site}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-truncate text-primary text-decoration-none"
                          style={{ maxWidth: '180px', display: 'inline-block' }}
                        >
                          {item.site}
                        </a>
                      </td>
                      <td>
                        <span className="text-truncate" style={{ maxWidth: '140px', display: 'inline-block' }}>
                          {item.username}
                        </span>
                      </td>
                      <td>
                        <span className="text-monospace">
                          {visiblePasswords[item.id] ? item.password : "••••••••"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-1">
                          <button
                            className="btn btn-outline-secondary btn-sm p-1 d-flex align-items-center justify-content-center"
                            style={{ width: '28px', height: '28px' }}
                            onClick={() => togglePasswordVisibility(item.id)}
                            title={visiblePasswords[item.id] ? "Hide password" : "Show password"}
                          >
                            <img
                              src={visiblePasswords[item.id] ? "/assets/off.png" : "/assets/on.png"}
                              alt="Toggle"
                              width="16"
                              className="invert"
                            />
                          </button>

                          <button
                            className="btn btn-outline-secondary btn-sm p-1 d-flex align-items-center justify-content-center"
                            style={{ width: '28px', height: '28px' }}
                            onClick={() => copyText(item.username)}
                            title="Copy Username"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                            </svg>
                          </button>

                          <button
                            className="btn btn-outline-secondary btn-sm p-1 d-flex align-items-center justify-content-center"
                            style={{ width: '28px', height: '28px' }}
                            onClick={() => copyText(item.password)}
                            title="Copy Password"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.5.5H7.465A4 4 0 0 1 0 8m4-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6"/>
                            </svg>
                          </button>

                          <button
                            className="btn btn-outline-secondary btn-sm p-1 d-flex align-items-center justify-content-center"
                            style={{ width: '28px', height: '28px' }}
                            onClick={() => editPassword(item.id)}
                            title="Edit"
                          >
                            <img src="/assets/edit.svg" alt="Edit" width="14" />
                          </button>

                          <button
                            className="btn btn-outline-danger btn-sm p-1 d-flex align-items-center justify-content-center"
                            style={{ width: '28px', height: '28px' }}
                            onClick={() => deletePassword(item.id)}
                            title="Delete"
                          >
                            <img src="/assets/delete.svg" alt="Delete" width="14" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {isEditModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border border-secondary text-light">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">Edit Password</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsEditModalOpen(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="edit-site" className="form-label">Website URL</label>
                  <input
                    type="text"
                    className="form-control bg-secondary text-white border-secondary"
                    id="edit-site"
                    name="site"
                    value={editForm.site}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="edit-username" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control bg-secondary text-white border-secondary"
                    id="edit-username"
                    name="username"
                    value={editForm.username}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="edit-password" className="form-label">Password</label>
                  <div className="input-group">
                    <input
                      type={showPasswordEdit ? "text" : "password"}
                      className="form-control bg-secondary text-white border-secondary"
                      id="edit-password"
                      name="password"
                      value={editForm.password}
                      onChange={handleEditChange}
                      required
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowPasswordEdit(!showPasswordEdit)}
                      title={showPasswordEdit ? "Hide password" : "Show password"}
                    >
                      <img
                        src={showPasswordEdit ? "/assets/off.png" : "/assets/on.png"}
                        alt={showPasswordEdit ? "Hide" : "Show"}
                        width="20"
                        className="invert"
                      />
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveEditedPassword}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </>
  );
};

export default Manager;
