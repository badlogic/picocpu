declare module picocpu {
    class Range {
        line: number;
        start: number;
        end: number;
        index: number;
        length(): number;
    }
    enum TokenType {
        IntegerLiteral = 0,
        FloatLiteral = 1,
        StringLiteral = 2,
        Identifier = 3,
        Opcode = 4,
        Register = 5,
        Colon = 6,
        Coma = 7,
        EndOfFile = 8,
    }
    class Token {
        position: Range;
        type: TokenType;
        value: string | number;
        constructor(position: Range, type: TokenType, value?: string | number);
    }
    class Assembler {
        assemble(source: string): void;
        private isDigit(char);
        private isAlpha(char);
        private isWhitespace(char);
        private getIdentifierType(identifier);
        tokenize(source: string): Token[];
    }
}
declare module picocpu.tests {
    function runTests(): void;
}
declare module picocpu {
    class VirtualMachine {
    }
}
