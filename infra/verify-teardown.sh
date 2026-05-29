#!/usr/bin/env bash
# Run after the teardown workflow to confirm all cost-generating resources
# were removed. Expected output for each section is noted inline.
# Usage: bash infra/verify-teardown.sh
set -euo pipefail

REGION="us-east-1"
CLUSTER="ai-hub"
SERVICE="ai-hub"
ECR_REPO="ai-hub"

echo "======================================================"
echo " ai-hub teardown verification"
echo " Region: $REGION"
echo "======================================================"

# ── ECS service ────────────────────────────────────────────────────────────
# Expected: empty list []
echo ""
echo "=== ECS Services ==="
aws ecs list-services --cluster "$CLUSTER" --region "$REGION" 2>/dev/null \
  || echo "(cluster not found — already deleted)"

# ── ECS cluster ────────────────────────────────────────────────────────────
# Expected: Status INACTIVE or cluster not found
echo ""
echo "=== ECS Cluster ==="
aws ecs describe-clusters --clusters "$CLUSTER" --region "$REGION" \
  --query "clusters[0].{Status:status,ActiveServices:activeServicesCount}" 2>&1

# ── ALB ────────────────────────────────────────────────────────────────────
# Expected: [] (empty — delete-express-gateway-service removes it automatically)
echo ""
echo "=== Application Load Balancers (ecs-express prefix) ==="
aws elbv2 describe-load-balancers --region "$REGION" \
  --query "LoadBalancers[?contains(LoadBalancerName,'ecs-express')].{Name:LoadBalancerName,State:State.Code}" 2>&1

# ── ECR images ─────────────────────────────────────────────────────────────
# Expected: 0 untagged images (tagged images for rollback are fine to keep)
echo ""
echo "=== ECR Untagged Images ==="
UNTAGGED=$(aws ecr list-images \
  --repository-name "$ECR_REPO" --region "$REGION" \
  --filter tagStatus=UNTAGGED \
  --query "length(imageIds)" --output text 2>&1)
echo "Untagged image count: $UNTAGGED"

echo ""
echo "=== ECR Tagged Images (kept for rollback) ==="
aws ecr list-images \
  --repository-name "$ECR_REPO" --region "$REGION" \
  --filter tagStatus=TAGGED \
  --query "imageIds[*].imageTag" --output table 2>&1

# ── CloudWatch log groups ──────────────────────────────────────────────────
# Expected: no /aws/ecs/ai-hub/* or /aws/apprunner/ai-hub/* groups
echo ""
echo "=== CloudWatch Log Groups (ai-hub) ==="
aws logs describe-log-groups --region "$REGION" \
  --log-group-name-prefix "/aws/ecs/ai-hub" \
  --query "logGroups[*].{Name:logGroupName,StoredBytes:storedBytes}" 2>&1

# ── Fargate tasks ──────────────────────────────────────────────────────────
# Expected: [] (no running tasks = no compute billing)
echo ""
echo "=== Running Fargate Tasks ==="
aws ecs list-tasks --cluster "$CLUSTER" --region "$REGION" 2>/dev/null \
  || echo "(cluster not found — no tasks running)"

echo ""
echo "======================================================"
echo " Summary of resources that persist with no cost:"
echo "   VPC, subnets, IGW  (CloudFormation stack: ai-hub-infra)"
echo "   IAM roles + OIDC provider"
echo "   ECR repository (tagged images only)"
echo ""
echo " To fully remove VPC + cluster (nuclear teardown):"
echo "   aws cloudformation delete-stack --stack-name ai-hub-infra --region $REGION"
echo "======================================================"
