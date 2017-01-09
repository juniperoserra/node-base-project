/**
 * Created by sgreenwo on 12/10/16.
 */

process.on('unhandledRejection', function(reason, p) {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason.stack);
});

import "babel-polyfill";
import ArgParser from './ArgParser';
import cli from './cli';
import someCommand from './commands/someCommand';

const argParser = new ArgParser(cli);
const program = argParser.parse(process.argv);
//console.log(program);

async function run() {
    if (program.command === 'someCommand') {
        await someCommand();
    }
}

run();
