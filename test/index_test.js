var test = require('tap').test;
var parser = require('../');

test('should return hyperscript', function(t) {
  parser('<h1 foo="beep">Hello World</h1>', function(err, hscript) {
    t.equals(hscript, 'h("h1", { "foo": "beep"}, [ "Hello World" ])', 'success')
    t.end()
  })
})

test('should return hyperscript with dataset nested attributes', function(t) {
  parser('<h1 foo="beep" data-test-me="sheep" bar="keep" data-test-you="jeep">Hello World</h1>', function(err, hscript) {
    t.equals(hscript, 'h("h1", { "foo": "beep",\n    "bar": "keep",\n    "dataset": { "testMe": "sheep",\n    "testYou": "jeep"}}, [ "Hello World" ])', 'success')
    t.end()
  })
})
