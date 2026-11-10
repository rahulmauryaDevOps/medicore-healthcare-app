import { useEffect, useState } from 'react'
import './App.css'

const API = 'http://8.234.116.164/api/patients'

function App() {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', age: '', gender: 'Male'
  })

  const loadPatients = async () => {
    try {
      setError('')
      const response = await fetch(API)
      if (!response.ok) throw new Error('Unable to load patients')
      setPatients(await response.json())
    } catch {
      setError('Backend API is not reachable. Please check the backend deployment.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [])

  const addPatient = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, age: Number(form.age) })
      })
      if (!response.ok) throw new Error()
      setForm({ name: '', email: '', phone: '', age: '', gender: 'Male' })
      await loadPatients()
    } catch {
      setError('Patient registration failed. Check backend API.')
    }
  }

  const deletePatient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return
    try {
      const response = await fetch(`${API}/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error()
      await loadPatients()
    } catch {
      setError('Unable to delete patient.')
    }
  }

  const filtered = patients.filter(p =>
    `${p.name} ${p.email} ${p.phone}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><span>✚</span> MediCore</div>
        <p className="nav-heading">MAIN MENU</p>
        <div className="nav active">▦ &nbsp; Dashboard</div>
        <div className="nav">♙ &nbsp; Patients</div>
        <div className="nav">▣ &nbsp; Appointments</div>
        <div className="nav">⚙ &nbsp; Settings</div>
        <div className="sidebar-bottom">Healthcare Management Platform</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h2>Dashboard</h2>
            <p>Welcome to MediCore Healthcare</p>
          </div>
          <div className="admin"><span>RM</span> Admin</div>
        </header>

        <section className="content">
          <div className="welcome">
            <div>
              <h1>Healthcare Dashboard</h1>
              <p>Manage your patients and their information in one place.</p>
            </div>
            <span className="welcome-icon">✚</span>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="stats">
            <div className="stat-card">
              <span>Total Patients</span>
              <strong>{patients.length}</strong>
              <small>Registered patients</small>
            </div>
            <div className="stat-card">
              <span>Male Patients</span>
              <strong>{patients.filter(p => p.gender === 'Male').length}</strong>
              <small>Patient records</small>
            </div>
            <div className="stat-card">
              <span>Female Patients</span>
              <strong>{patients.filter(p => p.gender === 'Female').length}</strong>
              <small>Patient records</small>
            </div>
          </div>

          <div className="layout">
            <section className="panel">
              <div className="panel-title">
                <div><h3>Patient Directory</h3><p>Manage registered patients</p></div>
                <input
                  className="search"
                  placeholder="Search patients..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {loading ? <p>Loading patients...</p> : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Patient</th><th>Phone</th><th>Age</th><th>Gender</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {filtered.map(p => (
                        <tr key={p.id}>
                          <td><strong>{p.name}</strong><small>{p.email}</small></td>
                          <td>{p.phone}</td>
                          <td>{p.age}</td>
                          <td>{p.gender}</td>
                          <td><button className="delete" onClick={() => deletePatient(p.id)}>Delete</button></td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr><td colSpan="5" className="empty">No patients found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="panel form-panel">
              <h3>Register Patient</h3>
              <p className="subtext">Add a new patient record</p>
              <form onSubmit={addPatient}>
                <label>Full Name</label>
                <input required placeholder="Enter patient name" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} />

                <label>Email Address</label>
                <input required type="email" placeholder="patient@example.com" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})} />

                <label>Phone Number</label>
                <input required placeholder="Enter phone number" value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})} />

                <div className="form-row">
                  <div><label>Age</label>
                    <input required type="number" min="1" max="120" value={form.age}
                      onChange={e => setForm({...form, age: e.target.value})} />
                  </div>
                  <div><label>Gender</label>
                    <select value={form.gender}
                      onChange={e => setForm({...form, gender: e.target.value})}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <button className="submit" type="submit">+ Register Patient</button>
              </form>
            </section>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
