// denoserver.js
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { serveDir } from 'https://deno.land/std@0.224.0/http/file_server.ts'

const basePath = Deno.cwd() // current working dir (editor/)
const port = 9900

serve(
    async req => {
        const url = new URL(req.url)

        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: corsHeaders(),
            })
        }

        // PUT support
        if (req.method === 'PUT') {
            const pathname = decodeURIComponent(url.pathname.slice(1))
            const fullPath = `${basePath}/${pathname}`

            try {
                const body = await req.text()
                await Deno.writeTextFile(fullPath, body)
                console.log(`PUT ${fullPath}`)
                return new Response('OK', {
                    status: 200,
                    headers: corsHeaders(),
                })
            } catch (err) {
                console.error('PUT error:', err)
                return new Response('PUT failed', {
                    status: 500,
                    headers: corsHeaders(),
                })
            }
        }

        // Serve files (GET, HEAD)
        const response = await serveDir(req, {
            fsRoot: basePath,
            showDirListing: true,
            quiet: true,
        })

        // Add CORS headers to file responses too
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set(
            'Access-Control-Allow-Methods',
            'GET, PUT, OPTIONS'
        )
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type')

        return response
    },
    { port }
)

console.log(`✅ Deno server running at http://localhost:${port}/`)

function corsHeaders() {
    return new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    })
}
