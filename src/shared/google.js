/* global location, localStorage, IS_DEV */
const REDIRECT_URL = IS_DEV ? 'http://localhost:3000' : 'https://nabulator.nabusound.com'
const CLIENT_ID = '366006877589-ook6bcpd8or7n9sjtdplg7r1ii3k61ev.apps.googleusercontent.com'
const SCOPE = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata'
].join(' ')

const FILE_NAME = 'nabulator.json'
const BOUNDARY = 'gc0p4Jq0M2Yt08jU534c0p'
const BODY = `
--${BOUNDARY}
Content-Type: application/json

{
  "name": "${FILE_NAME}",
  "mimeType": "application/json"
}
--${BOUNDARY}
Content-Type: application/json
Content-Transfer-Encoding: base64

DATA
--${BOUNDARY}--`

const TOKEN_VALIDITY = 3_600_000 // Less than 1 hour.

// Initialise token.
let token
if (!token) {
  // Handle token expiry.
  const tokenTime = parseInt(localStorage.getItem('token_time') || '0', 10)
  if (Date.now() - tokenTime > TOKEN_VALIDITY) {
    localStorage.removeItem('token')
    localStorage.removeItem('token_time')
  }

  // Check for token in URL fragment (available after sign in redirect from Google).
  // Save token to local storage.
  const tokenFromUrl = (new URLSearchParams(location.hash)).get('access_token')
  if (tokenFromUrl) {
    localStorage.setItem('token', tokenFromUrl)
    localStorage.setItem('token_time', Date.now().toString())
    location.hash = ''
  }

  // Load token from local storage.
  token = localStorage.getItem('token')
}

export function signOut () {
  token = null
}

function getAuthHeaders () {
  return { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
}

export function signIn () {
  // Google's OAuth 2.0 endpoint for requesting an access token
  const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth'

  // Create <form> element to submit parameters to OAuth 2.0 endpoint.
  const form = document.createElement('form')
  form.setAttribute('method', 'GET') // Send as a GET request.
  form.setAttribute('action', oauth2Endpoint)

  // Parameters to pass to OAuth 2.0 endpoint.
  const params = {
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URL,
    response_type: 'token',
    scope: SCOPE,
    include_granted_scopes: 'true',
    state: 'pass-through value'
  }

  // Add form parameters as hidden input values.
  for (const p in params) {
    const input = document.createElement('input')
    input.setAttribute('type', 'hidden')
    input.setAttribute('name', p)
    input.setAttribute('value', params[p])
    form.appendChild(input)
  }

  // Add form to page and submit it to open the OAuth 2.0 endpoint.
  document.body.appendChild(form)
  form.submit()
}

export async function getEmail () {
  if (!token) {
    return null
  }

  const res = await fetch(`https://www.googleapis.com/oauth2/v2/tokeninfo?accessToken=${token}`)
  const data = await res.json()
  return data.email
}

export async function load () {
  if (!token) {
    return []
  }

  const id = await get()

  // Get the file if exists.
  if (id) {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, { headers: getAuthHeaders() })
    const data = await res.json()
    return data
  }

  return []
}

export async function save (data) {
  if (!token) {
    return
  }

  const id = await get()
  const path = id ? `/upload/drive/v3/files/${id}` : '/upload/drive/v3/files'

  const params = {
    method: id ? 'PATCH' : 'POST',
    params: { uploadType: 'multipart' },
    headers: {
      ...getAuthHeaders(),
      'Content-Type': `multipart/mixed; boundary="${BOUNDARY}"`
    },
    body: BODY.replace('DATA', window.btoa(JSON.stringify(data)))
  }

  const obj = await (await fetch(`https://www.googleapis.com${path}?uploadType=multipart`, params)).json()
  console.log(`Saved to: ${obj.name}`)
}

async function get () {
  // Search for the save file.
  const query = encodeURIComponent(`name = '${FILE_NAME}'`)
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}`, { headers: getAuthHeaders() })
  const data = await res.json()
  return data.files?.[0]?.id
}
