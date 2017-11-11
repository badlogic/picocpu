module picocpu.tests {
	export function runTests () {
		let assembler = new picocpu.Assembler();
		console.log(assembler.tokenize(`
			STRING: "This is a test.\\nWith a new line."
			INTEGER: 234234
			NEGATIVEINTEGER: -234234
			FLOAT: 2.3423
			NEGATIVEFLOAT: -324.3242

			# This is a comment
			load LABEL, r0
			move 123,
			# eol comment`
		));
	}
}