const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const runner = path.join(__dirname, 'benchmark.js');

function run(...args) {
    return spawnSync(process.execPath, [runner, ...args], { encoding: 'utf8' });
}

// Missing rows or a leaf wait shorter than requested must fail.
test('writes one duration per chain and waits at the leaf', () => {
    const result = run('--total-calls', '10', '--recursion-depth', '10', '--method-time', '500000');
    assert.equal(result.status, 0, result.stderr);
    const rows = result.stdout.trim().split('\n');
    assert.equal(rows.length, 10);
    for (const row of rows) {
        assert.match(row, /^0;\d+$/);
        assert.ok(BigInt(row.split(';')[1]) >= 500000n);
    }
});

test('runs zero-duration leaves at depth one', () => {
    const result = run('--total-calls', '3', '--recursion-depth', '1', '--method-time', '0');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim().split('\n').length, 3);
    assert.match(result.stderr, /Last leaf timestamp: \d+/);
});

test('rejects invalid options without producing samples', () => {
    for (const args of [
        ['--total-calls', '0'], ['--total-calls', '1.5'],
        ['--recursion-depth', '-1'], ['--recursion-depth', 'abc'],
        ['--method-time', '-1'], ['--method-time', ''],
        ['--total-calls'], ['--unknown', '1'],
    ]) {
        const result = run(...args);
        assert.equal(result.status, 1);
        assert.equal(result.stdout, '');
        assert.match(result.stderr, /Error:/);
    }
});
