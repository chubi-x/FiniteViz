export async function generateMesh (body) {
  const response = await fetch('http://127.0.0.1:3000/message', {
    method: 'POST',
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
    mode: 'cors',
    headers: {
      'Content-type': 'application/json',
      Accept: 'application/json'
    }
  })
  return await response.json()
}
// export async function pollNewMesh
