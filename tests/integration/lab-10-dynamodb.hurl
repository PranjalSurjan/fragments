# tests/integration/lab-10-dynamodb.hurl

# 1. POST a new JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`{ "service": "DynamoDB" }`

# Confirm 201 and capture Location and id
HTTP/1.1 201
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# 2. GET the fragment info (metadata)
GET {{fragment1_url}}/info
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment1_id}}
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 25
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString

# 3. POST a second Markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`DynamoDB is **great**.`

# Confirm 201 and capture Location and id
HTTP/1.1 201
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# 4. GET the second fragment info (metadata)
GET {{fragment2_url}}/info
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment2_id}}
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 22
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString

# 5. GET all fragments (ids only) and confirm both are included
GET http://localhost:8080/v1/fragments
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" contains {{fragment1_id}}
jsonpath "$.fragments" contains {{fragment2_id}}

# 6. DELETE the first fragment
DELETE {{fragment1_url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

# 7. Try to GET the first fragment again - should be 404
GET {{fragment1_url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 404

# 8. GET all fragments again - first should be gone, second should remain
GET http://localhost:8080/v1/fragments
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" not contains {{fragment1_id}}
jsonpath "$.fragments" contains {{fragment2_id}}
