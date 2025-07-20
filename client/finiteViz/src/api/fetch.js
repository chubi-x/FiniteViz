export async function generateMesh(body) {
  const response = await fetch(`api/message`, {
    method: "POST",
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
    mode: "cors",
    headers: {
      "Content-type": "application/json",
      Accept: "application/json",
      // "ngrok-skip-browser-warning": "true",
    },
  });
  return await response.json();
}
// export async function pollNewMesh
