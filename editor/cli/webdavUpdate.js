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

const path = '/agentscript/users/bob/Ants/Model.js'

// 1. Fetch Model.js
let modelText = await client.getFileContents(path, { format: 'text' })
console.log('Original:', modelText.slice(0, 100), '...')

// 2. Modify the model
modelText = modelText.replace('population = 200', 'population = 20')

// 3. Save it back
await client.putFileContents(path, modelText, { overwrite: true })
console.log('✅ Model.js updated with new population value')

// 4. Confirm change (optional re-read)
const updated = await client.getFileContents(path, { format: 'text' })
console.log(
    'Updated:',
    updated.includes('population = 20') ? '✅ Confirmed' : '❌ Not found'
)

// console.log('updated', updated)
