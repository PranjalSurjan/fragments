# tests/integration/lab-9-s3.hurl

# 1. POST a new text fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`Hello S3!`

# Confirm 201 and capture Location
HTTP/1.1 201
[Captures]
url: header "Location"

# 2. GET the fragment we just created
GET {{url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
[Asserts]
body == "Hello S3!"

# 3. DELETE the fragment
DELETE {{url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

# 4. GET the fragment again - should be 404
GET {{url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 404
