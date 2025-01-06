"use strict";

const REDIRECT_URL = "https://nabulator.nabusound.com";
// const REDIRECT_URL = 'http://localhost:8080'
const CLIENT_ID =
  "366006877589-ook6bcpd8or7n9sjtdplg7r1ii3k61ev.apps.googleusercontent.com";
const SCOPE = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.appdata",
].join(" ");

const FILE_NAME = "nabulator.json";
const BOUNDARY = "gc0p4Jq0M2Yt08jU534c0p";
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
--${BOUNDARY}--`;

class Google {
  static getInstance() {
    Google.instance = Google.instance || new Google();
    return Google.instance;
  }

  constructor() {
    // Get access token.
    this.token = (new URLSearchParams(location.hash)).get("access_token") ||
      localStorage.getItem("token");
    if (this.token) {
      localStorage.setItem("token", this.token);
    }

    this.auth = {
      Authorization: `Bearer ${this.token}`,
      Accept: "application/json",
    };
    location.hash = "";
  }

  async getEmail() {
    const res = await fetch(
      `https://www.googleapis.com/oauth2/v2/tokeninfo?accessToken=${this.token}`,
    );
    const data = await res.json();
    return data.email;
  }

  signIn() {
    // Google's OAuth 2.0 endpoint for requesting an access token
    const oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth";

    // Create <form> element to submit parameters to OAuth 2.0 endpoint.
    const form = document.createElement("form");
    form.setAttribute("method", "GET"); // Send as a GET request.
    form.setAttribute("action", oauth2Endpoint);

    // Parameters to pass to OAuth 2.0 endpoint.
    const params = {
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URL,
      response_type: "token",
      scope: SCOPE,
      include_granted_scopes: "true",
      state: "pass-through value",
    };

    // Add form parameters as hidden input values.
    for (const p in params) {
      const input = document.createElement("input");
      input.setAttribute("type", "hidden");
      input.setAttribute("name", p);
      input.setAttribute("value", params[p]);
      form.appendChild(input);
    }

    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();
  }

  async get() {
    // Search for the save file.
    const query = encodeURIComponent(`name = '${FILE_NAME}'`);
    const data =
      await (await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}`,
        { headers: this.auth },
      )).json();
    return data.files?.[0]?.id;
  }

  async load() {
    const id = await this.get();

    // Get the file if exists.
    if (id) {
      const data =
        await (await fetch(
          `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
          { headers: this.auth },
        )).json();
      return data;
    }

    return null;
  }

  async save(data) {
    const id = await this.get();
    const path = id ? `/upload/drive/v3/files/${id}` : "/upload/drive/v3/files";

    const params = {
      method: id ? "PATCH" : "POST",
      params: { uploadType: "multipart" },
      headers: {
        ...this.auth,
        "Content-Type": `multipart/mixed; boundary="${BOUNDARY}"`,
      },
      body: BODY.replace("DATA", window.btoa(JSON.stringify(data))),
    };

    const obj =
      await (await fetch(
        `https://www.googleapis.com${path}?uploadType=multipart`,
        params,
      )).json();
    console.log(`Saved to: ${obj.name}`);
  }
}

export const google = Google.getInstance();
