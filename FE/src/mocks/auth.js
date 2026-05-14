async function callMock(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}

export function mockLogin(email, password) {
  return callMock('/api/mock/login', { email, password })
}

export function mockRegister(fields) {
  return callMock('/api/mock/register', fields)
}
