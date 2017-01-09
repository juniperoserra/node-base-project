/**
 * Created by sgreenwo on 12/11/16.
 */

const chalk = require('chalk');
// TODO: Get rid of lodash requirement
const _ = require('lodash');

const util = {};
util.assert = function(condition, msg) {
    if (!condition) {
        throw new Error('Assertion: ' + msg);
    }
};

util.assertAlways = function(msg) {
    throw new Error('Assertion: ' + msg);
};

util.errorAssertNoStack = function(condition, type, msg) {
    if (!condition) {
        util.assert(type && msg, 'Must error with both message type and message content');
        console.log(chalk.red('ERROR: ' + msg));
        process.exit(1);
    }
};

function _isString(s) {
    return typeof s === 'string' || s instanceof String;
}

function _isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function _dashToUnderscore(word) {
    return word.replace(/-/g, '_');
}

function _underscoreToCamel(word) {
    return word.replace(/(_[a-z])/g, low => low[1].toUpperCase());
}

function _camelToUnderscore(word) {
    return word.replace(/([A-Z])/g, cap => '_' + cap.toLowerCase());
}

function _scrubOpt(arg) {
    return _underscoreToCamel(_dashToUnderscore(arg));
}

function _makeOptHash(optionsSpec) {
    const optHash = {};
    optionsSpec.forEach(opt => {
        const argName = opt.optName || _scrubOpt(opt.aliases[0]);
        opt.aliases.forEach(alias => {
            alias = _scrubOpt(alias);
            util.assert(!optHash[alias], 'Redundant option alias: ' + alias);
            optHash[alias] = { name: argName, values: opt.values };
        });
    });
    return optHash;
}

function _asOption(arg, optHash) {
    if (!arg || !_isString(arg)) {
        return undefined;
    }
    arg = arg.trim();
    if (arg[0] === '-') {
        arg = arg.replace(/^-+/, '');
    }
    else {
        return undefined;
    }
    arg = _scrubOpt(arg);
    const optData = optHash[arg];
    if (!optData) {
        return undefined;
    }

    return optData.name;
}

function normalizeCmd(input) {
    return _underscoreToCamel(_dashToUnderscore(input)).toLowerCase();
}

function _selectCommand(cmdList, arg) {
    arg = arg || '';
    let skipArgs = 1;
    let command = arg;
    for (let cmd of cmdList) {
        cmd.normalized = normalizeCmd(cmd.command);
    }

    let cmdObj = undefined;
    if (!command || command[0] === '_') {
        cmdObj = cmdList.find(cmd => cmd.default);
        skipArgs = 0;
    } else {
        cmdObj = cmdList.find(cmd => cmd.normalized === normalizeCmd(command));
    }

    util.errorAssertNoStack(cmdObj,
        'unknown command', `Unknown command "${arg}"\nPossible commands: ${_.map(cmdList, 'command').join(', ')}`);
    return [ cmdObj.command, skipArgs ];
}

function _optDone(opts, opt, args) {
    if (!opt && args.length === 0) {
        return;
    }
    if (opt) {
        if (args.length === 0) { // Maybe check for legality of bool?
            opts[opt] = true;
        }
        else {
            let fullArray = [];
            args.forEach(arg => {
                arg.split(',').forEach(element => {
                    if (_isNumeric(element)) {
                        element = parseInt(element, 10);
                    }
                    fullArray.push(element);
                });
            });
            if (fullArray.length === 1) {
                fullArray = fullArray[0];
            }
            opts[opt] = fullArray;
        }
    }
}

function _parseOpts(args, optsHash) {
    const opts = {};
    let currentOpt = null;
    let currentOptArgs = [];
    if (args) {
        args.forEach(arg => {
            const nextOpt = _asOption(arg, optsHash);
            if (nextOpt) {
                _optDone(opts, currentOpt, currentOptArgs);
                currentOpt = nextOpt;
                currentOptArgs = [];
            }
            else {
                util.errorAssertNoStack(arg[0] !== '-' && currentOpt, 'unknown option', 'Unknown option "' + arg + '"');
                currentOptArgs.push(arg);
            }
        });
    }
    _optDone(opts, currentOpt, currentOptArgs);
    return opts;
}

// Command line format:
// single or double-dash equivalent
// no merged single letter opts

// Syntax
// command [arg] [value]

// Rule: first thing is command (plural or not)
// Rule: if it starts with - or --, it's an option
// Rule: plurals allowed for most options
// Rule: we can allow spaces inside lists!

function ArgParser(cli) {
    if (!(this instanceof ArgParser)) {
        return new ArgParser();
    }
    // Instance construction below

    this._optsList = cli.options || [];
    this._cmdsList = cli.commands || [];

    this._examples = cli.examples || '';
    this._usage = cli.usage || '';
    this._optsHash = _makeOptHash(this._optsList);
}

ArgParser.prototype.validateValue = (optionName, value) => {
    const opt = this._optsHash[optionName];
    util.assert(opt, 'Unknown option "' + optionName + '"');
    const negated = (/^(no-|~|!)/).test(value.trim());
    if (opt.values) {
        const bareValue = value.trim().replace(/^(no-|~|!)/, '').toLowerCase();
        for (let i = 0; i < opt.values.length; i++) {
            const matchValue = opt.values[i];
            if (matchValue.toLowerCase() === bareValue) {
                return (negated ? '!' : '') + matchValue;
            }
        }
        util.assertAlways('Value "' + value + '" not valid for option "' + optionName +
            '." Allowed values are ' + opt.values);
    }
    return value.trim();
};

ArgParser.prototype.parse = function parse(argv, continueAfterHelp) {
    const program = {};

    if ((argv.length < 3 && !_.find(this._cmdsList, cmd => cmd.default)) || argv[2] === 'help' || _asOption(argv[2], this._optsHash) === 'help') {
        this.showHelp(continueAfterHelp);
        program.command = 'help';
        program.opts = {};
    }
    else {
        let skipArgs;
        [ program.command, skipArgs ] = _selectCommand(this._cmdsList, argv[2]);
        const args = argv.slice(2 + skipArgs);
        program.opts = _parseOpts(args, this._optsHash);
    }
    return program;
};

function _formatAliases(aliases) {
    const sortedAliases = aliases.slice(0); // Clone the array since sort is modifying
    return sortedAliases.sort((a, b) => a.length > b.length).map(alias => {
        return '-' + alias;
    }).join(', ');
}

function _formatOpt(opt) {
    let str = _formatAliases(opt.aliases);
    if (opt.args) {
        str = str + ' ' + opt.args;
    }
    return str;
}

function _formatValues(opt) {
    let str = '';
    if (opt.values) {
        str = ' ';
        str = str + '[' + opt.values.join(', ') + ']';
    }
    return str;
}

ArgParser.prototype.getHelp = function getHelp() {
    const maxCommandLength = Math.max.apply(null, _.map(_.map(this._cmdsList, 'command'), c => c.length));
    this._cmdsList.forEach(cmd => {
        cmd.help = '    ' + cmd.command + new Array(maxCommandLength - cmd.command.length + 3).join(' ') + cmd.desc;
    });
    const commandHelp = 'Commands:\n\n' + _.map(this._cmdsList, 'help').join('\n');

    let indent = 0;
    this._optsList.forEach(opt => {
        const help = _formatOpt(opt);
        opt.help = help;
        indent = Math.max(indent, help.length);
    });
    indent += 2;
    this._optsList.forEach(opt => {
        const desc = opt.desc;
        opt.help = '    ' + opt.help + new Array(indent - opt.help.length + 1).join(' ') +
            desc + _formatValues(opt, indent);
    });
    return this._usage +
        commandHelp +
        '\n\nOptions:\n' + _.map(this._optsList, 'help').join('\n') + '\n\n' + this._examples;
};

ArgParser.prototype.showHelp = function showHelp(continueAfterHelp) {
    const helpStr = this.getHelp();
    console.log(helpStr);
    if (!continueAfterHelp) {
        process.exit(0);
    }
};

module.exports = ArgParser;
