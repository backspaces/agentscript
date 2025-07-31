// clone-example.js
// deno run -A clone-example.js Fire bob

import { AuthType, createClient } from 'https://esm.sh/webdav@5.8.0'

// --- Setup WebDAV Client ---
const token =
    'eyJhbGciOiJQUzI1NiIsImtpZCI6Ik9uU1RDMDhjbXhWendBMUtrb3YxdDNTQ3RNUWtyR3FOa1RzN1NjSHhlM28ifQ.eyJzdWJkb21haW4iOiJhZ2VudHNjcmlwdCIsInJvbGVzIjpbImFkbWluIl0sInN1YiI6ImV5M3FweDR2dDg5aWd0YzhvajhoZzJ3aiIsImlhdCI6MTc1MzEyNDczMSwiaXNzIjoiZXkzcXB4NHZ0ODlpZ3RjOG9qOGhnMndqIn0.2kdGyLZ64QNNTzEs4sNDK1dL0rclxOWtD_HiQTOXiiw1V0x_qIpvnM7l9bvKId7XHLePc1YnzaBwf0P2RjGb092YcwMK_4phospSWjRWSLU4nYRZcjvnV2xJ3c8IlBsmFI4Kw7k5BlSrvi5tznjwyNt5PZwn5XMwtdRG-qBktSbY3JJGxNFflFdyxPVWoPQNdXBHg-JFNNzQ6YcIvrr5R0L3RabX6M45tuNbcF0IBDDD2jO_NXSIPyTbcfvau5AyyQaP0vrLJqxaP_InRVj7JGoymyIZbxgmSS5edA_mzUPZ4LZfZEZ10Ukc0WYQzXpRwVVmYtbYkoILyEfum_1QEQ'

const client = createClient('https://agentscript.webdav.acequia.io:3334/', {
    authType: AuthType.Token,
    token: {
        token_type: 'Bearer',
        access_token: token,
    },
})

// --- Clone Function ---
async function cloneExampleToUser(example, user, overwrite = true) {
    const srcPath = `/agentscript/ide/examples/${example}/`
    const dstPath = `/agentscript/users/${user}/${example}/`

    if (!(await client.exists(dstPath))) {
        await client.createDirectory(dstPath)
        console.log(`📁 Created: ${dstPath}`)
    } else {
        console.log(`📁 Already exists: ${dstPath}`)
    }

    const files = await client.getDirectoryContents(srcPath)
    for (const file of files) {
        const src = file.filename
        const dst = src.replace(srcPath, dstPath)
        if (overwrite || !(await client.exists(dst))) {
            await client.copyFile(src, dst, { overwrite: true })
            console.log(`✅ Copied: ${src} → ${dst}`)
        } else {
            console.log(`⏭️ Skipped (already exists): ${dst}`)
        }
    }
}

// --- CLI Entry Point ---
if (import.meta.main) {
    const [example, user] = Deno.args
    if (!example || !user) {
        console.error('❌ Usage: deno run -A clone-example.js <example> <user>')
        Deno.exit(1)
    }

    await cloneExampleToUser(example, user)
}
