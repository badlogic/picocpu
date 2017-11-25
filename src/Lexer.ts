module picocpu {
	export class Range {
		line: number;
		start: number;
		end: number;
		index: number;

		constructor (public source: string) {};

		length () {
			return this.end - this.start;
		}
	}

	export enum TokenType {
		IntegerLiteral,
		FloatLiteral,
		StringLiteral,
		Identifier,
		Opcode,
		Register,
		Colon,
		Coma,
		EndOfFile
	}

	export class Token {
		constructor (public position: Range, public type: TokenType, public value: string | number = null) {}
	}

	class Stream {
		index: number = 0;
		line: number = 1;
		column: number = 1;
		private range: Range;

		constructor (public source: string) {}

		peek() {
			return this.source.charAt(this.index);
		}

		next() {
			let char = this.source.charAt(this.index);
			this.index++;
			this.column++;
			if (char == "\n") {
				this.line++;
				this.column = 1;
			}

			return char;
		}

		startRange() {
			let range = new Range(this.source);
			range.line = this.line;
			range.index = this.index;
			range.start = this.column;
			range.end = this.column + 1;

			this.range = range;
		}

		endRange() {
			let range = this.range;
			range.end = this.column;
			this.range = null;
			return range;
		}
	}

	var OPCODES = [ "nop",
					"add", "subtract", "multiply", "divide", "modulo",
					"fadd", "fsubtract", "fmultiply", "fdivide", "fmodulo",
					"and", "or", "not", "xor",
					"shiftleft", "shiftright", "shiftrightunsigned",
					"jump", "jumpequal", "jumpnotequal", "jumpless", "jumpgreater", "jumplessequal", "jumpgreaterequal",
					"move", "store", "load",
					"push", "pop",
					"call" ];
	var REGISTERS = [ "rip", "rsp", "r0", "r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9", "r10", "r11", "r12", "r13", "r14", "r15", "r16"];

	export class Lexer {
		private isDigit (char: string) {
			return char >= '0' && char <= '9';
		}

		private isAlpha (char: string) {
			var lowerCase = char.toLowerCase();
			return lowerCase >= 'a' && lowerCase <= 'z';
		}

		private isWhitespace (char: string) {
			return char == ' ' || char == '\n' || char == '\r' || char == '\t';
		}

		private getIdentifierType (identifier: string) {
			for (var i = 0; i < OPCODES.length; i++) {
				if (identifier == OPCODES[i])
					return TokenType.Opcode;
			}

			for (var i = 0; i < REGISTERS.length; i++) {
				if (identifier == REGISTERS[i])
					return TokenType.Register;
			}

			return TokenType.Identifier;
		}

		tokenize (source: string) {
			let tokens = new Array<Token>();
			let stream = new Stream(source);

			while (true) {
				stream.startRange();
				var char = stream.next();

				// EOF
				if (char.length == 0) {
					tokens.push(new Token(stream.endRange(), TokenType.EndOfFile));
					break;
				}

				// whitespace
				if (this.isWhitespace(char)) {
					while (this.isWhitespace(stream.peek())) {
						stream.next();
					}
					stream.endRange();
					continue;
				}

				// colon
				if (char == ':') {
					tokens.push(new Token(stream.endRange(), TokenType.Colon, ":"));
					continue;
				}

				// coma
				if (char == ',') {
					tokens.push(new Token(stream.endRange(), TokenType.Coma, ","));
					continue;
				}

				// number
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

					if (number == '-') {
						throw new AssemblerError(stream.endRange(), "Expected a negative number (-1234)");
					}

					tokens.push(new Token(stream.endRange(), isFloat ? TokenType.FloatLiteral : TokenType.IntegerLiteral, number));
					continue;
				}

				// identifier or keyword
				if (this.isAlpha(char)) {
					var identifier = char;

					while (this.isAlpha(stream.peek()) || this.isDigit(stream.peek()) || stream.peek() == '_') {
						identifier += stream.next();
					}
					tokens.push(new Token(stream.endRange(), this.getIdentifierType(identifier), identifier));
					continue;
				}

				// string
				if (char == '"') {
					var string = char;
					while (true) {
						char = stream.next();
						if (char == '\\') {
							let special = stream.next();
							if (special == '\\') {
								string += special;
							} else if (special == "n") {
								string += "\n";
							} else if (special == "r") {
								string += "\r";
							} else if (special == "t") {
								string += "\t";
							} else if (special == "\"") {
								string += '"';
							} else {
								string += "\\" + special;
							}
						} else if (char == "\"") {
							break;
						} else if (char.length == 0) {
							throw new AssemblerError(stream.endRange(), "Expected closing \" character for string")
						} else {
							string += char;
						}
					}
					tokens.push(new Token(stream.endRange(), TokenType.StringLiteral, string));
					continue;
				}

				// comment
				if (char == '#') {
					while (stream.peek() != '\n' && stream.peek().length > 0) {
						stream.next();
					}
					continue;
				}

				throw new AssemblerError(stream.endRange(), `Expected a colon (:), coma (,), number (123.2), identifier (myLabel) or keyword (move, r1)! Got '${char}'`);
			}

			return tokens;
		}
	}

}