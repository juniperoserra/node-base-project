/**
 * Created by sgreenwo on 12/11/16.
 */

const _optionsSpec = [
    {
        aliases: ['number', 'n'],
        args: '<count>',
        desc: 'Some number in string form.',
        values: ['one', 'two', 'three'],
        default: 'one'
    }
];

const _commandsSpec = [
    {
        command: 'someCommand',
        desc: 'Perform some command.'
    }
];

const usage =
`This program does something truly amazing. Watch yourself.
    Manual: http://inside.mathworks.com/wiki/Otter
    Support: Contact Simon Greenwold

`;

const examples =
`Example:
    pgm someCommand -n two  # Ties both shoes at once
    pgm someCommand -n three  # You can probably guess
`;

module.exports = {
    commands: _commandsSpec,
    options: _optionsSpec,
    usage,
    examples
};
