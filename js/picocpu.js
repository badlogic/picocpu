var picocpu;
(function (picocpu) {
    var Range = (function () {
        function Range() {
        }
        Range.prototype.length = function () {
            return this.end - this.start;
        };
        return Range;
    }());
    picocpu.Range = Range;
    var TokenType;
    (function (TokenType) {
        TokenType[TokenType["IntegerLiteral"] = 0] = "IntegerLiteral";
        TokenType[TokenType["FloatLiteral"] = 1] = "FloatLiteral";
        TokenType[TokenType["StringLiteral"] = 2] = "StringLiteral";
        TokenType[TokenType["Identifier"] = 3] = "Identifier";
        TokenType[TokenType["Opcode"] = 4] = "Opcode";
        TokenType[TokenType["Register"] = 5] = "Register";
        TokenType[TokenType["Colon"] = 6] = "Colon";
        TokenType[TokenType["Coma"] = 7] = "Coma";
        TokenType[TokenType["EndOfFile"] = 8] = "EndOfFile";
    })(TokenType = picocpu.TokenType || (picocpu.TokenType = {}));
    var Token = (function () {
        function Token(position, type, value) {
            if (value === void 0) { value = null; }
            this.position = position;
            this.type = type;
            this.value = value;
        }
        return Token;
    }());
    picocpu.Token = Token;
    var Stream = (function () {
        function Stream(source) {
            this.source = source;
            this.index = 0;
            this.line = 1;
            this.column = 1;
        }
        Stream.prototype.peek = function () {
            return this.source.charAt(this.index);
        };
        Stream.prototype.next = function () {
            var char = this.source.charAt(this.index);
            this.index++;
            this.column++;
            if (char == "\n") {
                this.line++;
                this.column = 1;
            }
            return char;
        };
        Stream.prototype.startRange = function () {
            var range = new Range();
            range.line = this.line;
            range.index = this.index;
            range.start = this.column;
            range.end = this.column + 1;
            this.range = range;
        };
        Stream.prototype.endRange = function () {
            var range = this.range;
            range.end = this.column;
            this.range = null;
            return range;
        };
        return Stream;
    }());
    var OPCODES = ["nop",
        "add", "subtract", "multiply", "divide", "modulo",
        "fadd", "fsubtract", "fmultiply", "fdivide", "fmodulo",
        "and", "or", "not", "xor",
        "shiftleft", "shiftright", "shiftrightunsigned",
        "jump", "jumpequal", "jumpnotequal", "jumpless", "jumpgreater", "jumplessequal", "jumpgreaterequal",
        "move", "store", "load",
        "push", "pop",
        "call"];
    var REGISTERS = ["rip", "rsp", "r0", "r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9", "r10", "r11", "r12", "r13", "r14", "r15", "r16"];
    var Assembler = (function () {
        function Assembler() {
        }
        Assembler.prototype.assemble = function (source) {
            var tokens = this.tokenize(source);
        };
        Assembler.prototype.isDigit = function (char) {
            return char >= '0' && char <= '9';
        };
        Assembler.prototype.isAlpha = function (char) {
            var lowerCase = char.toLowerCase();
            return lowerCase >= 'a' && lowerCase <= 'z';
        };
        Assembler.prototype.isWhitespace = function (char) {
            return char == ' ' || char == '\n' || char == '\r' || char == '\t';
        };
        Assembler.prototype.getIdentifierType = function (identifier) {
            for (var i = 0; i < OPCODES.length; i++) {
                if (identifier == OPCODES[i])
                    return TokenType.Opcode;
            }
            for (var i = 0; i < REGISTERS.length; i++) {
                if (identifier == REGISTERS[i])
                    return TokenType.Register;
            }
            return TokenType.Identifier;
        };
        Assembler.prototype.tokenize = function (source) {
            var tokens = new Array();
            var stream = new Stream(source);
            while (true) {
                stream.startRange();
                var char = stream.next();
                if (char.length == 0) {
                    tokens.push(new Token(stream.endRange(), TokenType.EndOfFile));
                    break;
                }
                if (this.isWhitespace(char)) {
                    while (this.isWhitespace(stream.peek())) {
                        stream.next();
                    }
                    stream.endRange();
                    continue;
                }
                if (char == ':') {
                    tokens.push(new Token(stream.endRange(), TokenType.Colon));
                    continue;
                }
                if (char == ',') {
                    tokens.push(new Token(stream.endRange(), TokenType.Coma));
                    continue;
                }
                if (char == '-' || this.isDigit(char)) {
                    var number = char;
                    var isFloat = false;
                    while (this.isDigit(stream.peek())) {
                        number += stream.next();
                    }
                    if (stream.peek() == '.') {
                        isFloat = true;
                        number += stream.next();
                        while (this.isDigit(stream.peek())) {
                            number += stream.next();
                        }
                    }
                    tokens.push(new Token(stream.endRange(), isFloat ? TokenType.FloatLiteral : TokenType.IntegerLiteral, number));
                    continue;
                }
                if (this.isAlpha(char)) {
                    var identifier = char;
                    while (this.isAlpha(stream.peek()) || this.isDigit(stream.peek()) || stream.peek() == '_') {
                        identifier += stream.next();
                    }
                    tokens.push(new Token(stream.endRange(), this.getIdentifierType(identifier), identifier));
                    continue;
                }
                throw new Error("Expected a colon (:), coma (,), number (123.2), identifier (myLabel) or keyword (move, r1)! Got '" + char + "'");
            }
            return tokens;
        };
        return Assembler;
    }());
    picocpu.Assembler = Assembler;
})(picocpu || (picocpu = {}));
var picocpu;
(function (picocpu) {
    var tests;
    (function (tests) {
        function runTests() {
            var assembler = new picocpu.Assembler();
            assembler.assemble("\n\t\t\tSTRING: \"This is a test.\\nWith a new line.\"\n\t\t\tINTEGER: 234234\n\t\t\tNEGATIVEINTEGER: -234234\n\t\t\tFLOAT: 2.3423\n\t\t\tNEGATIVEFLOAT: -324.3242\n\n\t\t\t# This is a comment\n\t\t\tload LABEL, r0\n\t\t\tmove 123,\n\t\t");
        }
        tests.runTests = runTests;
    })(tests = picocpu.tests || (picocpu.tests = {}));
})(picocpu || (picocpu = {}));
var picocpu;
(function (picocpu) {
    var VirtualMachine = (function () {
        function VirtualMachine() {
        }
        return VirtualMachine;
    }());
    picocpu.VirtualMachine = VirtualMachine;
})(picocpu || (picocpu = {}));
//# sourceMappingURL=picocpu.js.map