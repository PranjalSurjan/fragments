# tests/integration/post-fragments-unauthenticated.hurl
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
`This should fail because I'm not logged in`

HTTP/1.1 401
[Asserts]
jsonpath "$.status" == "error"
