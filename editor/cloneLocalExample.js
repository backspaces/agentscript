// cloneLocalExample.js
// Usage: deno run -A cloneLocalExample.js Ants bob

import { AuthType, createClient } from 'https://esm.sh/webdav@5.8.0'
import { join } from 'https://deno.land/std@0.224.0/path/mod.ts'

const webdavServer = 'https://agentscript.webdav.acequia.io:3334/'

// --- WebDAV Setup ---
const token =
    'eyJhbGciOiJQUzI1NiIsImtpZCI6Ik9uU1RDMDhjbXhWendBMUtrb3YxdDNTQ3RNUWtyR3FOa1RzN1NjSHhlM28ifQ.eyJzdWJkb21haW4iOiJhZ2VudHNjcmlwdCIsInJvbGVzIjpbImFkbWluIl0sInN1YiI6ImV5M3FweDR2dDg5aWd0YzhvajhoZzJ3aiIsImlhdCI6MTc1MzEyNDczMSwiaXNzIjoiZXkzcXB4NHZ0ODlpZ3RjOG9qOGhnMndqIn0.2kdGyLZ64QNNTzEs4sNDK1dL0rclxOWtD_HiQTOXiiw1V0x_qIpvnM7l9bvKId7XHLePc1YnzaBwf0P2RjGb092YcwMK_4phospSWjRWSLU4nYRZcjvnV2xJ3c8IlBsmFI4Kw7k5BlSrvi5tznjwyNt5PZwn5XMwtdRG-qBktSbY3JJGxNFflFdyxPVWoPQNdXBHg-JFNNzQ6YcIvrr5R0L3RabX6M45tuNbcF0IBDDD2jO_NXSIPyTbcfvau5AyyQaP0vrLJqxaP_InRVj7JGoymyIZbxgmSS5edA_mzUPZ4LZfZEZ10Ukc0WYQzXpRwVVmYtbYkoILyEfum_1QEQ'

const client = createClient(webdavServer, {
    authType: AuthType.Token,
    token: {
        token_type: 'Bearer',
        access_token: token,
    },
})

// --- Clone from local to WebDAV ---
async function cloneLocalExample(example, user) {
    const localDir = join('./examples', example)
    const remoteDir = `/agentscript/users/${user}/${example}/`

    // Ensure remote dir exists
    if (!(await client.exists(remoteDir))) {
        await client.createDirectory(remoteDir)
        console.log(`📁 Created: ${remoteDir}`)
    }

    for (const filename of ['index.html', 'Model.js', 'View.js']) {
        const localPath = join(localDir, filename)
        const remotePath = remoteDir + filename

        try {
            const content = await Deno.readTextFile(localPath)
            await client.putFileContents(remotePath, content, {
                overwrite: true,
            })
            console.log(`✅ Uploaded: ${remotePath}`)
        } catch (err) {
            console.warn(`⚠️ Skipped missing file: ${localPath}`)
        }
    }
}

// --- CLI ---
if (import.meta.main) {
    const [example, user] = Deno.args
    if (!example || !user) {
        console.error(
            '❌ Usage: deno run -A cloneLocalExample.js <example> <user>'
        )
        Deno.exit(1)
    }
    await cloneLocalExample(example, user)
}
