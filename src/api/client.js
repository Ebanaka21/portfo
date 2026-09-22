const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

async function request(path, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...options,
  })

  const data = await res.json()

  if (!res.ok) {
    const details = data.build_log ? `\n\n${data.build_log}` : ''
    throw new Error(`${data.error || 'Request failed'}${details}`)
  }

  return data
}

// Auth
export const register = (email, password, name) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  })

export const login = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const logout = () =>
  request('/auth/logout', { method: 'POST' })

export const getMe = () => request('/auth/me')

export const updateProfile = (data) =>
  request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })

// Projects
export const getProjects = () => request('/projects')

export const getProject = (id) => request(`/projects/${id}`)

export const createProject = (data) =>
  request('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateProject = (id, data) =>
  request(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const deleteProject = (id) =>
  request(`/projects/${id}`, {
    method: 'DELETE',
  })

export const uploadProjectFiles = (id, files) =>
  request(`/admin/projects/${id}/upload`, {
    method: 'POST',
    body: files,
  })

// Inquiries
export const createInquiry = (data) =>
  request('/inquiries', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const getInquiries = () => request('/admin/inquiries')

export const getAdminDashboard = () => request('/admin/dashboard')

export const updateInquiry = (id, data) =>
  request(`/admin/inquiries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
