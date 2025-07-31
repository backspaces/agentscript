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

// List directory contents
const contents = await client.getDirectoryContents('/agentscript/ide/examples/')
console.log(contents)

const ants = await client.getDirectoryContents('/agentscript/ide/examples/Ants')
console.log(JSON.stringify(ants, null, 2))
// console.log(ants)

// output all of agentscript in this webdav
const as = await client.getDirectoryContents('/agentscript/', { deep: true })
const filenames = as.map(obj => obj.filename)
console.log(filenames)
// console.log(JSON.stringify(as, null, 2))

// Create new user directorys
if (!(await client.exists('/agentscript/users'))) {
    await client.createDirectory('/agentscript/users')
}

if (!(await client.exists('/agentscript/users/bob'))) {
    await client.createDirectory('/agentscript/users/bob')
}

const bobDir = await client.getDirectoryContents('/agentscript/users/bob/')
console.log(bobDir)

// const bobAnts = await client.getDirectoryContents('/agentscript/users/bob/Ants')
// console.log(bobAnts)
