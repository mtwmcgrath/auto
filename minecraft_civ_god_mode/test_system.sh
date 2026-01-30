#!/bin/bash
echo "================================"
echo "MEGA BOT SYSTEM - VERIFICATION"
echo "================================"
echo ""

echo "✓ Checking bot files..."
BOT_COUNT=$(find bots/layer* -name "*.js" 2>/dev/null | wc -l)
echo "  Found $BOT_COUNT new layer bot files"

echo ""
echo "✓ Checking documentation..."
for doc in README_MEGA_BOTS.md QUICKSTART.md IMPLEMENTATION_SUMMARY.md PROJECT_COMPLETE.md; do
  if [ -f "$doc" ]; then
    LINES=$(wc -l < "$doc")
    echo "  ✓ $doc - $LINES lines"
  fi
done

echo ""
echo "✓ Checking templates..."
TEMPLATE_COUNT=$(find data/templates -name "*.json" 2>/dev/null | wc -l)
echo "  Found $TEMPLATE_COUNT template files"

echo ""
echo "✓ Checking configuration..."
if [ -f "config/bot_fleet.json" ]; then
  echo "  ✓ Bot fleet configuration exists"
fi

echo ""
echo "✓ Checking scripts..."
if [ -f "scripts/launch_bots.js" ]; then
  echo "  ✓ Bot launcher exists"
fi
if [ -f "src/command_center.js" ]; then
  echo "  ✓ Command center exists"
fi

echo ""
echo "✓ Checking package.json scripts..."
grep -A 3 '"orchestrator"' package.json > /dev/null && echo "  ✓ orchestrator script"
grep -A 3 '"mega"' package.json > /dev/null && echo "  ✓ mega script"
grep -A 3 '"launch"' package.json > /dev/null && echo "  ✓ launch script"

echo ""
echo "================================"
echo "VERIFICATION COMPLETE"
echo "================================"
echo ""
echo "To start the system:"
echo "  npm install"
echo "  npm run launch"
echo ""
