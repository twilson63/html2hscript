# html2hscript

Parse html to hyperscript library.

[![Build Status](https://travis-ci.org/twilson63/html2hscript.svg?branch=master)](https://travis-ci.org/twilson63/html2hscript)

## Usage

``` js
var parser = require('html2hscript');
parser('<h1>Hello World</h1>', function(err, hscript) {
  console.log(hscript);
});
```

## Install

``` sh
npm install html2hscript
```

## Test

``` sh
npm test
```

## Support

Submit Issue in Github

## Contributions

Pull Requests are welcome

## License

MIT

## Thanks

[https://www.npmjs.com/~unframework](https://www.npmjs.com/~unframework) who wrote the parsing code.

[https://www.npmjs.com/~dominictarr](https://www.npmjs.com/~dominictarr) who wrote hyperscript.