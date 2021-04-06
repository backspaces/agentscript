const string =
    'eyJhcGlLZXkiOiJBSXphU3lBYXM5R2tldmhMajNrNlBTYUdNMzZoTlFRVVRtTWJ6b1kiLCJwcm9qZWN0SWQiOiJmaXJlYmFzZS1iYWNrc3BhY2VzIiwiZGF0YWJhc2VVUkwiOiJodHRwczovL2JhY2tzcGFjZXMuZmlyZWJhc2Vpby5jb20ifQ=='
const text = atob(string)
const obj = JSON.parse(text)
export default obj
