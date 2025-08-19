#!/bin/bash
cd /home/kavia/workspace/code-generation/e-commerce-platform-8103/ecommerce_backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

