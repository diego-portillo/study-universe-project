#!/usr/bin/env bash
# Usage:
#   ./infra/deploy.sh                  # first deploy (creates OIDC provider)
#   ./infra/deploy.sh --no-oidc        # re-deploy without re-creating OIDC provider
set -euo pipefail

STACK_NAME="ai-hub-infra"
REGION="us-east-1"
TEMPLATE="$(dirname "$0")/cloudformation.yaml"
CREATE_OIDC="true"

if [[ "${1:-}" == "--no-oidc" ]]; then
  CREATE_OIDC="false"
fi

aws cloudformation deploy \
  --region "$REGION" \
  --stack-name "$STACK_NAME" \
  --template-file "$TEMPLATE" \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides CreateOIDCProvider="$CREATE_OIDC" \
  --no-fail-on-empty-changeset

echo ""
echo "=== Stack outputs (paste into GitHub Secrets) ==="
aws cloudformation describe-stacks \
  --region "$REGION" \
  --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs" \
  --output table
