// code pulled from https://www.npmjs.com/package/html2hyperscript
var Parser = require('htmlparser2').Parser;

var elementStack = [];

function ItemList(parent) {
    this.parent = parent;
    this.content = '';
    this.spacer = '';
    this.indent = parent ? parent.indent : '';
    this.isFirstItem = true;
}

ItemList.prototype.addSpace = function (space) {
    this.spacer += space;

    if (space.indexOf("\n") !== -1) {
        // reset indent when there are new lines
        this.indent = /[^\n]*$/.exec(space)[0];
    } else {
        // otherwise keep appending to current indent
        this.indent += space;
    }
}

ItemList.prototype.add = function (data, ignoreComma) {
    if (!ignoreComma) {
        if (!this.isFirstItem) {
            this.content += this.spacer.length ? ',' : ', ';
        }

        this.isFirstItem = false;
    }

    this.content += this.spacer;
    this.spacer = '';

    this.content += data;
}

module.exports = function(html, cb) {
    var currentItemList = new ItemList(null);

    var parser = new Parser({
        onopentag: function (name, attribs) {
            currentItemList = new ItemList(currentItemList);
            elementStack.unshift([ name, attribs ]);
        },
        ontext: function (text) {
            currentItemList.add(JSON.stringify(text));
            /*var lines = text.split("\n");

            var isFirst = true;

            lines.forEach(function (line) {
                var lineMatch = /^(\s*)(.*?)(\s*)$/.exec(line);

                var preSpace = lineMatch[1],
                    mainText = lineMatch[2],
                    postSpace = lineMatch[3];

                if (!isFirst) {
                    currentItemList.addSpace("\n");
                }

                currentItemList.addSpace(preSpace);

                if (mainText.length > 0) {
                    currentItemList.add(JSON.stringify(mainText));
                }

                isFirst = false;
            });*/
        },
        onclosetag: function (tagname) {
            var element = elementStack.shift();
            var elementContent = currentItemList.content + currentItemList.spacer;

            currentItemList = currentItemList.parent;

            var indent = currentItemList.indent;

            var attribs = element[1];

            var id = attribs['id'];
            var idSuffix = id !== undefined ? '#' + id : '';
            delete attribs['id'];

            var classNames = attribs['class'];
            var classSuffix = (classNames !== undefined ? classNames : '').split(/\s+/g).filter(function (v) { return v.length > 0; }).map(function (cls) { return '.' + cls; }).join('');
            delete attribs['class'];

            var attrPairs = Object.keys(attribs).map(function (k) { return JSON.stringify(k) + ': ' + JSON.stringify(attribs[k]) });

            var item = 'h(' + JSON.stringify(element[0] + idSuffix + classSuffix) + (
                attrPairs.length
                    ? ", { " + attrPairs.join(",\n" + indent + '    ') + " }"
                    : ''
            ) + (
                elementContent.length
                    ? ', [' + (elementContent[0] === "\n" ? '' : ' ') + elementContent + (elementContent.match(/\s$/) ? '' : ' ') + ']'
                    : ''
            ) + ')';

            currentItemList.add(item);
        },
        oncomment: function (text) {
            currentItemList.add('/*' + text + '*/', false); // @todo comment-safety
        },
        onend: function () {
          cb(null, currentItemList.content);
        }
    }, {decodeEntities: true});

  parser.write(html);
  parser.end();
}