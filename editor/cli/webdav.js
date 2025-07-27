// Import and create client with JWT Bearer token
// import { AuthType, createClient } from 'https://santafe.alert.live/webdav.js'
import { AuthType, createClient } from 'https://esm.sh/webdav@5.8.0'

// const serverUrl = 'https://agentscript.webdav.acequia.io:3334/'
const token =
    'eyJhbGciOiJQUzI1NiIsImtpZCI6Ik9uU1RDMDhjbXhWendBMUtrb3YxdDNTQ3RNUWtyR3FOa1RzN1NjSHhlM28ifQ.eyJzdWJkb21haW4iOiJhZ2VudHNjcmlwdCIsInJvbGVzIjpbImFkbWluIl0sInN1YiI6ImV5M3FweDR2dDg5aWd0YzhvajhoZzJ3aiIsImlhdCI6MTc1MzEyNDczMSwiaXNzIjoiZXkzcXB4NHZ0ODlpZ3RjOG9qOGhnMndqIn0.2kdGyLZ64QNNTzEs4sNDK1dL0rclxOWtD_HiQTOXiiw1V0x_qIpvnM7l9bvKId7XHLePc1YnzaBwf0P2RjGb092YcwMK_4phospSWjRWSLU4nYRZcjvnV2xJ3c8IlBsmFI4Kw7k5BlSrvi5tznjwyNt5PZwn5XMwtdRG-qBktSbY3JJGxNFflFdyxPVWoPQNdXBHg-JFNNzQ6YcIvrr5R0L3RabX6M45tuNbcF0IBDDD2jO_NXSIPyTbcfvau5AyyQaP0vrLJqxaP_InRVj7JGoymyIZbxgmSS5edA_mzUPZ4LZfZEZ10Ukc0WYQzXpRwVVmYtbYkoILyEfum_1QEQ'

const client = createClient('https://agentscript.webdav.acequia.io:3334/', {
    authType: AuthType.Token,
    token: {
        token_type: 'Bearer',
        access_token: token,
    },
})

const srcPath = '/agentscript/ide/examples/Fire/'
const dstPath = '/agentscript/users/bob/Fire/'

// 1. Create target directory if needed
if (!(await client.exists(dstPath))) {
    await client.createDirectory(dstPath)
    console.log('📁 Created:', dstPath)
}

// 2. List files in Fire example
const files = await client.getDirectoryContents(srcPath)
console.log(
    '📄 Files to copy:',
    files.map(f => f.basename)
)

// 3. Copy each file into bob/Fire/
for (const file of files) {
    const src = file.filename
    const dst = src.replace(srcPath, dstPath)
    await client.copyFile(src, dst)
    console.log(`✅ Copied: ${src} → ${dst}`)
}

// 4. Confirm clone
const cloned = await client.getDirectoryContents(dstPath)
console.log(
    '📁 Contents of bob/Fire:',
    cloned.map(f => f.basename)
)
