module picocpu {
	export class AssemblerError {
		constructor(public position: Range, public message: string) {};
	}

	export class Assembler {
		assemble (source: string) {
			let tokens = new Lexer().tokenize(source);
		}

		parse (tokens: Array<Token>): Array<Instruction> {
			let instructions = new Array<Instruction>();

			return instructions;
		}
	}

	export class Instruction {

	}
}