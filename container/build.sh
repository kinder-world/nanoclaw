#!/bin/bash
# Build the NanoClaw agent container image

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

IMAGE_NAME="nanoclaw-agent"
TAG="${1:-latest}"

echo "Building NanoClaw agent container image..."
echo "Image: ${IMAGE_NAME}:${TAG}"

# Run dependency audit before building (FINDING-10)
echo ""
echo "Auditing agent-runner dependencies..."
(cd agent-runner && npm audit --audit-level=high) || {
    echo "WARNING: npm audit found high/critical vulnerabilities in agent-runner"
    echo "Fix with: cd container/agent-runner && npm audit fix"
    echo "Continuing build anyway (review output above)"
}

# Build with Apple Container
container build -t "${IMAGE_NAME}:${TAG}" .

echo ""
echo "Build complete!"
echo "Image: ${IMAGE_NAME}:${TAG}"
echo ""
echo "Test with:"
echo "  echo '{\"prompt\":\"What is 2+2?\",\"groupFolder\":\"test\",\"chatJid\":\"test@g.us\",\"isMain\":false}' | container run -i ${IMAGE_NAME}:${TAG}"
