import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { extname, join } from 'https://deno.land/std@0.224.0/path/mod.ts'

const root = './'  // Adjust as needed

serve(async req => {
  const url = new URL(req.url)
  const pathname = decodeURIComponent(url.pathname)
  const fullPath = join(root, pathname)

  if (req.method === 'PUT') {
    const body = await req.text()
    try {
      await Deno.mkdir(join(fullPath, '..'), { recursive: true })
      await Deno.writeTextFile(fullPath, body)
      return new Response('Saved', { status: 200 })
    } catch (err) {
      console.error('PUT error:', err)
      return new Response('Failed to save file', { status: 500 })
    }
  }

  try {
    const file = await Deno.readFile(fullPath)
    const contentType = {
      '.js': 'application/javascript',
      '.html': 'text/html',
      '.json': 'application/json',
    }[extname(fullPath)] || 'application/octet-stream'

    return new Response(file, {
      headers: { 'Content-Type': contentType },
    })
  } catch (err) {
    return new Response('Not found', { status: 404 })
  }
}, { port: 9100 })

console.log('Server running on http://localhost:9100')
