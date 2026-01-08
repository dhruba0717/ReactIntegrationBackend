import React, { useEffect, useState } from 'react'
import './App.css'

const API = 'http://localhost:8080/api/todos'

export default function App() {
  const [todos, setTodos] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTodos()
  }, [])

  async function fetchTodos() {
    setLoading(true)
    try {
      const res = await fetch(API)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setTodos(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function addTodo() {
    if (!newTitle.trim()) return
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), completed: false })
      })
      if (!res.ok) throw new Error('Create failed')
      const created = await res.json()
      setTodos(prev => [...prev, created])
      setNewTitle('')
    } catch (err) {
      console.error(err)
    }
  }

  async function toggle(todo) {
    try {
      const res = await fetch(`${API}/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...todo, completed: !todo.completed })
      })
      if (res.ok) fetchTodos()
    } catch (err) {
      console.error(err)
    }
  }

  async function remove(id) {
    if (id == null) return
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
      if (res.ok) setTodos(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  async function editTitle(todo) {
    const title = window.prompt('Edit title', todo.title)
    if (title === null) return
    try {
      const res = await fetch(`${API}/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...todo, title })
      })
      if (res.ok) fetchTodos()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: '0 auto' }}>
      <h2>Simple To‑Do</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="New task"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={addTodo}>Add</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todos.map(t => (
            <li key={t.id} style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={!!t.completed} onChange={() => toggle(t)} />
              <span style={{ textDecoration: t.completed ? 'line-through' : 'none', flex: 1 }}>{t.title}</span>
              <button onClick={() => editTitle(t)}>Edit</button>
              <button onClick={() => remove(t.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
