export async function generateMesh (body) {
  const response = await fetch('http://127.0.0.1:3000/message', {
    method: 'POST',
    body: JSON.stringify(body),
    mode: 'cors',
    headers: {
      'Content-type': 'application/json',
      Accept: 'application/json'
    }
  })
  return await response.json()
}
export async function pollNewMesh (meshId) {
  const response = await fetch(`http://127.0.0.1:3000/poll/${meshId}`, {})
  return await response.json()
}
