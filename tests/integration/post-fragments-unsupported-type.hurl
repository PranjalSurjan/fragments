# tests/integration/post-fragments-unsupported-type.hurl
POST http://localhost:8080/v1/fragments
Content-Type: video/mp4
[BasicAuth]
test-user1@fragments-testing.com:password1
`some binary video data`

HTTP/1.1 415
[Asserts]
jsonpath "$.status" == "error"
