// code pulled from https://www.npmjs.com/package/html2hyperscript
var Parser = require('htmlparser2').Parser;
var camel = require('to-camel-case');
var isEmpty = require('is-empty');
var thisIsSVGTag = require('./lib/svg-namespaces').thisIsSVGTag,
    getSVGNamespace = require('./lib/svg-namespaces').getSVGNamespace,
    getSVGAttributeNamespace = require('./lib/svg-namespaces').getSVGAttributeNamespace;

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
            // Convert inline CSS style attribute to an object
            if(attribs['style']){
                var rules = attribs["style"].split(";");
                attribs["style"] = {};
                rules.forEach(function(rule){
                    var split = rule.split(":");
                    if(split.length == 2){
                        attribs["style"][split[0].trim()] = split[1].trim();
                    }
                });
            }

            var style = attribs['style']
            delete attribs['style']

            var dataset = {};
            var datasetKey;
            Object.keys(attribs).forEach(function (k) {
                if (k.slice(0, 5) === 'data-') {
                    datasetKey = camel(k.slice(5));
                    dataset[datasetKey] = attribs[k];
                    delete attribs[k];
                }
            });

            var attrPairs = Object.keys( attribs ).map( function ( k ) {
                return JSON.stringify( k ) + ': ' + JSON.stringify( attribs[ k ] )
            } );
            var datasetPairs = Object.keys( dataset ).map( function ( k ) {
                return JSON.stringify( k ) + ': ' + JSON.stringify( dataset[ k ] )
            } );

            var objects = {}
            if (attribs.value) {
                objects.value = attribs.value;
                delete attribs.value;
            }
            if ( !isEmpty( style ) ) objects.style = style
            if ( !isEmpty( attribs ) ) objects.attributes = attribs
            if ( !isEmpty( dataset ) ) objects.dataset = dataset
            if ( thisIsSVGTag( element[ 0 ] ) ) {
                objects.namespace = getSVGNamespace();

                Object.keys(attribs).forEach(function (k) {
                    var namespace = getSVGAttributeNamespace(k);

                    if (namespace === void 0) { // not a svg attribute
                        return;
                    }

                    var value = objects.attributes[ k ];

                    if (typeof value !== 'string' &&
                        typeof value !== 'number' &&
                        typeof value !== 'boolean'
                    ) {
                        return;
                    }

                    if (namespace !== null) { // namespaced attribute
                        objects[ k ] = 'SVGAttributeHook(\'' + namespace + '\',\'' + value + '\')';
                    }
                });
            }
            var objectStr = !isEmpty(objects) ? JSON.stringify(objects) : ""

            var item = 'h(' + JSON.stringify(element[0] + idSuffix + classSuffix) + (
                    (objectStr !== "") ? ", " + objectStr : ""
                )
                    //     attrPairs.length || datasetPairs.length
                    //         ? ", { \"attributes\": { "
                    //         : ''
                    // ) + (
                    //     attrPairs.length
                    //         ? attrPairs.join(",\n" + indent + '    ')
                    //         : ''
                    // ) + (
                    //     datasetPairs.length && attrPairs.length
                    //         ? ",\n" + indent + '    '
                    //         : ''
                    // ) + (
                    //     datasetPairs.length
                    //         ? "\"dataset\": { " + datasetPairs.join(",\n" + indent + '    ') + "}"
                    //         : ''
                    // ) + (
                    //     attrPairs.length || datasetPairs.length
                    //         ? "}}"
                    //         : ''
                    // )

                + (
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