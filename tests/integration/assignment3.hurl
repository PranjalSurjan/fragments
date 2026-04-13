# tests/integration/assignment3.hurl

# ============================================================
# 1. POST a plain text fragment
# ============================================================
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`Hello Assignment 3!`

HTTP/1.1 201
[Captures]
text_url: header "Location"
text_id: jsonpath "$.fragment.id"
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 19

# ============================================================
# 2. GET the plain text fragment back
# ============================================================
GET {{text_url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
header "Content-Type" contains "text/plain"
body == "Hello Assignment 3!"

# ============================================================
# 3. PUT (update) the plain text fragment
# ============================================================
PUT {{text_url}}
Content-Type: text/plain
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`Updated content!`

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{text_id}}
jsonpath "$.fragment.size" == 16

# ============================================================
# 4. GET the updated fragment to confirm the update worked
# ============================================================
GET {{text_url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
body == "Updated content!"

# ============================================================
# 5. POST a Markdown fragment
# ============================================================
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`# Hello`

HTTP/1.1 201
[Captures]
md_url: header "Location"
md_id: jsonpath "$.fragment.id"

# ============================================================
# 6. GET the Markdown fragment converted to HTML
# ============================================================
GET {{md_url}}.html
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
header "Content-Type" contains "text/html"
body contains "<h1>"

# ============================================================
# 7. GET the Markdown fragment as plain text
# ============================================================
GET {{md_url}}.txt
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
header "Content-Type" contains "text/plain"

# ============================================================
# 8. POST a JSON fragment
# ============================================================
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`{"name":"fragments","version":3}`

HTTP/1.1 201
[Captures]
json_url: header "Location"

# ============================================================
# 9. GET the JSON fragment converted to YAML
# ============================================================
GET {{json_url}}.yaml
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
header "Content-Type" contains "application/yaml"

# ============================================================
# 10. GET the JSON fragment as plain text
# ============================================================
GET {{json_url}}.txt
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
header "Content-Type" contains "text/plain"

# ============================================================
# 11. Try PUT with wrong content type - should return 400
# ============================================================
PUT {{text_url}}
Content-Type: application/json
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`{"wrong":"type"}`

HTTP/1.1 400
[Asserts]
jsonpath "$.status" == "error"

# ============================================================
# 12. DELETE the text fragment
# ============================================================
DELETE {{text_url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

# ============================================================
# 13. GET deleted fragment - should return 404
# ============================================================
GET {{text_url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 404
