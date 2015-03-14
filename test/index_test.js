var test = require('tap').test;
var parser = require('../');

test('should return hyperscript', function(t) {
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
