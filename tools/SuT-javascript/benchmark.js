const { parseArgs } = require('node:util');
const { monitoredMethod } = require('./monitored_application');

function main() {
    const { values } = parseArgs({
        options: {
            'total-calls': { type: 'string', default: '1000' },
            'recursion-depth': { type: 'string', default: '10' },
            'method-time': { type: 'string', default: '0' },
        },
    });

    for (const [name, value] of Object.entries(values)) {
        if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
            throw new Error(`${name} must be a nonnegative safe integer`);
        }
    }

    const totalCalls = Number(values['total-calls']);
    const recursionDepth = Number(values['recursion-depth']);
    const methodTime = BigInt(values['method-time']);
    if (totalCalls < 1 || recursionDepth < 1) {
        throw new Error('total-calls and recursion-depth must be positive');
    }
    // A conservative initial limit; larger depths need runtime-specific validation.
    if (recursionDepth > 1000) {
        throw new Error('recursion-depth must not exceed 1000');
    }

    const durations = new Array(totalCalls);
    let lastTimestamp;
    for (let i = 0; i < totalCalls; i++) {
        const start = process.hrtime.bigint();
        lastTimestamp = monitoredMethod(methodTime, recursionDepth);
        const stop = process.hrtime.bigint();
        durations[i] = stop - start;
    }

    // Match the Python runner's thread-id;elapsed-ns layout. Single thread for now.
    process.stdout.write(durations.map(duration => `0;${duration}\n`).join(''));
    console.error(`Node ${process.version}; ${process.platform} ${process.arch}`);
    console.error(`Calls: ${totalCalls}; depth: ${recursionDepth}; leaf time: ${methodTime} ns`);
    console.error(`Last leaf timestamp: ${lastTimestamp}`);
}

try {
    main();
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
}
