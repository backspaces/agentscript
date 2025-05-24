# Code	Meaning
# 401   Unauthorized
# 404 	File or folder not found
# 403   Forbidden (e.g. permissions)
# 405   Method not allowed
# 409   Conflict (e.g. parent folder missing)
# 423   Locked

root='https://webdav-server.glitch.me'
root='https://backspaces.net/webdav-server'
root='https://webdav-server.deno.dev'

echo $root

curl -s -X PROPFIND "$root" -H 'Depth: 1' | grep D:href

curl -i -X OPTIONS $root   \
  -H "Access-Control-Request-Method: GET"

curl -X PUT $root/hello.txt -d 'Hi from Curl!'
curl -X GET $root/hello.txt

curl -X DELETE $root/hello.txt

curl -X PUT $root/delete.txt -d 'Delete me!'
curl -X GET $root/delete.txt
curl -X DELETE $root/delete.txt
curl -X GET $root/delete.txt

curl -X MKCOL $root/folder/
curl -X PUT $root/folder/foo.txt -d 'I am in folder'
curl -X GET $root/folder/foo.txt

curl -X PUT $root/copy.txt -d 'I am getting copied!'
curl -X GET $root/copy.txt
curl -X COPY $root/copy.txt \
  -H "Destination: $root/copyed.txt"
curl -X GET $root/copyed.txt

curl -X PUT $root/move.txt -d 'I am moving!'
curl -X GET $root/move.txt
curl -X MOVE $root/move.txt \
  -H "Destination: $root/moved.txt"
curl -X GET $root/moved.txt

curl -X OPTIONS -i $root/


# =========

curl -X PROPFIND $root
curl -s -X PROPFIND $root | grep href

curl -X PROPFIND $root -H 'Depth: 1'
curl -s -X PROPFIND $root -H 'Depth: 1' | grep href
curl -s -X PROPFIND $root -H 'Depth: 1' | xmllint --format - | grep D:href


curl -i -X OPTIONS $root   \
  -H "Origin: http://localhost:9000" \
  -H "Access-Control-Request-Method: GET"

curl -X RESET -i $root/
curl -s -X PROPFIND $root -H 'Depth: 1' | xmlstarlet sel -N d="DAV:" -t -m "//d:response/d:href" -v "." -n
curl -X MKCOL $root/folder/
curl -s -X PROPFIND $root -H 'Depth: 1' | xmlstarlet sel -N d="DAV:" -t -m "//d:response/d:href" -v "." -n

curl -X RESET -i $root/
curl -X MKCOL $root/folder/
curl -s -X PROPFIND $root -H 'Depth: 1' | xmlstarlet sel -N d="DAV:" -t -m "//d:response/d:href" -v "." -n

PROPFIND_XML=$(curl -s -X PROPFIND $root -H 'Depth: 1')
echo "$PROPFIND_XML" | xmlstarlet sel -N d="DAV:" -t -m "//d:response/d:href" -v "." -n

curl -s -X PROPFIND $root -H 'Depth: 1' | xmlstarlet sel -N d="DAV:" -t -m "//d:response/d:href" -v "." -n


curl -X PUT $root/lockme.txt -d 'Lock Me!'
LOCK_RESPONSE=$(curl -X LOCK "$root/lockme.txt" \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?>
<D:lockinfo xmlns:D="DAV:">
  <D:lockscope><D:exclusive/></D:lockscope>
  <D:locktype><D:write/></D:locktype>
  <D:owner>
    <D:href>mailto:you@example.com</D:href>
  </D:owner>
</D:lockinfo>')

LOCK_TOKEN=$(echo "$LOCK_RESPONSE" | grep -i "Lock-Token" | awk '{print $2}' | tr -d '\r')

curl -X UNLOCK $root/lockme.txt \
  -H "Lock-Token: $LOCK_TOKEN"

curl -X RESET -i $root/

