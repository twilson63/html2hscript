var test = require('tap').test;
var parser = require('../');

test('should return hyperscript', function(t) {
  parser('<h1 foo="beep">Hello World</h1>', function(err, hscript) {
    t.equals(hscript, 'h("h1", { "foo": "beep"}, [ "Hello World" ])', 'success')
    t.end()
  })
})
