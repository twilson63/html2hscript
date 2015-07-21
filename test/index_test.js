var test = require('tap').test;
var parser = require('../');

test('should return attributes', function(t) {
  parser('<h1 foo="beep">Hello World</h1>', function(err, hscript) {
    t.equals(hscript, 'h("h1", { "foo": "beep" }, [ "Hello World" ])', 'success')
    t.end()
  })
})

test('should return hyperscript', function(t) {
  parser('<div><div><h1 foo="beep">Hello World</h1></div></div>', function(err, hscript) {
    t.equals(hscript, 'h("div", [ h("div", [ h("h1", { "foo": "beep" }, [ "Hello World" ]) ]) ])', 'success')
    t.end()
  })
})

test('should return children', function(t) {
  parser('<p>Hello\n<b>World</b></p>', function(err, hscript) {
    t.equals(hscript, 'h("p", [ "Hello\\n", h("b", [ "World" ]) ])', 'success')
    t.end()
  })
})

test('should handle correctly pre', function(t) {
  parser('<pre>Hello\nWorld</pre>', function(err, hscript) {
    t.equals(hscript, 'h("pre", [ "Hello\\nWorld" ])', 'success')
    t.end()
  })
})
