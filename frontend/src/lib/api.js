const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function uploadContract(file, token) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_URL}/api/contracts/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Upload failed')
  return data
}

export async function getContracts(token) {
  const res = await fetch(`${API_URL}/api/contracts/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch contracts')
  return data
}

export async function analyzeContract(contractId, token) {
  const res = await fetch(`${API_URL}/api/contracts/${contractId}/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Analysis failed')
  return data
}