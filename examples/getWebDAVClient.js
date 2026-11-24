import { AuthType, createClient } from 'https://esm.sh/webdav@5.8.0'

// A WebDAV client for AgentScript's files on acequia, used by the IDE
// (editor/) and by examples/uploadExamples.js.
//
// The token isn't in this file: this file is public (the IDE loads it
// from agentscript.org), so a token here would be public too. Instead,
// whoever uses it supplies their own token, from the acequia dashboard:
//
// - In a browser: add it to the page's address once, like
//     https://agentscript.org/editor/?token=<your token>
//   It's then kept in this browser (localStorage), so later visits don't
//   need it, and removed from the address bar.
// - In Deno: in an environment variable,
//     ACEQUIA_TOKEN=<your token> deno run -A examples/uploadExamples.js
//
// acequia accepts the token id or the JWT. Without a token, the client
// has none: reading works if the server allows it, writing won't.

const webdavServer = 'https://agentscript.acequia.io'

export function getWebDAVClient(token = findToken()) {
    const options = token
        ? {
              authType: AuthType.Token,
              token: { token_type: 'Bearer', access_token: token },
          }
        : {}
    if (!token) console.warn('getWebDAVClient: no acequia token, see its comments')
    const client = createClient(webdavServer, options)
    return [client, webdavServer]
}

// The token: in Deno from ACEQUIA_TOKEN, in a browser from ?token= in the
// address (then kept in localStorage) or from localStorage.
function findToken() {
    if (globalThis.Deno) return Deno.env.get('ACEQUIA_TOKEN')

    const key = 'acequiaToken'
    const url = new URL(location.href)
    const fromAddress = url.searchParams.get('token')
    if (fromAddress) {
        try {
            localStorage.setItem(key, fromAddress)
        } catch {} // storage may be blocked: the token still works this visit
        url.searchParams.delete('token')
        history.replaceState(null, '', url)
        return fromAddress
    }
    try {
        return localStorage.getItem(key)
    } catch {
        return null
    }
}
