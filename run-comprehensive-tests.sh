
#!/bin/bash

echo "=============================================="
echo "COMPREHENSIVE TEST SUITE"
echo "Running all test scenarios sequentially"
echo "=============================================="
echo ""

# Run the comprehensive test suite
npm test -- server/tests/comprehensive-test-suite.test.ts --reporter=verbose

echo ""
echo "=============================================="
echo "Test execution complete!"
echo "Check the output above for results"
echo "=============================================="
