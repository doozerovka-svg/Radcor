const { execSync } = require('child_process');
const path = require('path');

console.log('=== RUNNING FINAL EMPIRICAL VERIFICATION HARNESS ===\n');

try {
    const out1 = execSync(`node ${path.join(__dirname, 'stress_test.js')}`, { encoding: 'utf8' });
    console.log(out1);
    
    const out2 = execSync(`node ${path.join(__dirname, 'stress_test_extended.js')}`, { encoding: 'utf8' });
    console.log(out2);

    console.log('=== FINAL EMPIRICAL VERIFICATION COMPLETE: ALL PASS ===');
} catch (err) {
    console.error('❌ VERIFICATION FAILED:', err.stdout || err.message);
    process.exit(1);
}
