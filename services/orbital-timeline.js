/**
 * Orbital Timeline Component
 * Visualizes the 5-step process as an interactive orbital animation
 */

(function() {
  'use strict';

  // Timeline Data
  const TIMELINE_DATA = [
    {
      id: 1,
      num: '01',
      title: 'ERSTGESPRÄCH',
      desc: '30 bis 45 Minuten',
      content: 'Wir gehen Ihre Kanäle durch und schauen, wo Anfragen heute liegen bleiben. Kein Pitch.',
      status: 'completed',
      energy: 90,
      relatedIds: [2]
    },
    {
      id: 2,
      num: '02',
      title: 'BESTANDSAUFNAHME',
      desc: '1 bis 2 Wochen',
      content: 'Wir sehen uns an, was bei Ihnen läuft: DMS, Börsenzugänge, Werkstattplaner, Telefonanlage. Daraus wird eine Reihenfolge.',
      status: 'completed',
      energy: 85,
      relatedIds: [1, 3]
    },
    {
      id: 3,
      num: '03',
      title: 'ANBINDUNG',
      desc: '2 bis 4 Wochen',
      content: 'Wir bauen die Verbindung zu Ihren Systemen. Sie wechseln nichts, es kommt etwas dazu.',
      status: 'in-progress',
      energy: 95,
      relatedIds: [2, 4]
    },
    {
      id: 4,
      num: '04',
      title: 'PROBEBETRIEB',
      desc: 'rund 2 Wochen',
      content: 'Erst ein Kanal, ein Standort. Sie hören Gespräche mit und lesen jede Antwort, bevor der Rest dazukommt.',
      status: 'pending',
      energy: 80,
      relatedIds: [3, 5]
    },
    {
      id: 5,
      num: '05',
      title: 'BETRIEB',
      desc: 'laufend, monatlich',
      content: 'Wir betreiben, überwachen und entwickeln weiter. Ohne Mindestlaufzeit, Sie können jederzeit aussteigen.',
      status: 'pending',
      energy: 75,
      relatedIds: [4]
    }
  ];

  class OrbitalTimeline {
    constructor(containerId, serviceData = null) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;

      this.nodesContainer = document.getElementById('orbitalNodes');
      if (!this.nodesContainer) return;

      // Use service data if provided, otherwise fallback to TIMELINE_DATA
      this.data = this.prepareData(serviceData?.processSteps || TIMELINE_DATA);

      this.rotationAngle = 0;
      this.autoRotate = true;
      this.animationFrameId = null;
      this.activeNodeId = null;
      this.nodes = [];

      this.init();
    }

    prepareData(steps) {
      // If steps already have id property, return as-is
      if (steps.length > 0 && steps[0].id) {
        return steps;
      }

      // Otherwise, add id and default properties
      return steps.map((step, index) => ({
        id: index + 1,
        num: step.num,
        title: step.title,
        desc: step.desc,
        content: step.content,
        status: index === 0 ? 'completed' : index === 1 ? 'in-progress' : 'pending',
        energy: 90 - (index * 5),
        relatedIds: this.getRelatedIds(index, steps.length)
      }));
    }

    getRelatedIds(index, total) {
      const related = [];
      if (index > 0) related.push(index);
      if (index < total - 1) related.push(index + 2);
      return related;
    }

    init() {
      this.renderNodes();
      this.updateNodePositions(); // Initial positioning
      this.startRotation();
      this.setupEventListeners();
    }

    renderNodes() {
      const totalNodes = this.data.length;

      this.data.forEach((item, index) => {
        const node = this.createNode(item, index, totalNodes);
        this.nodesContainer.appendChild(node);
        this.nodes.push({ element: node, data: item });
      });
    }

    createNode(item, index, total) {
      const node = document.createElement('div');
      node.className = 'orbital-node';
      node.dataset.id = item.id;
      node.dataset.index = index;

      node.innerHTML = `
        <div class="orbital-node-inner">
          <div class="orbital-node-icon">${item.num}</div>
        </div>
        <div class="orbital-node-label">${item.title}</div>
        <div class="orbital-node-card">
          <div class="orbital-card-status">${this.getStatusText(item.status)}</div>
          <div class="orbital-card-title">${item.title}</div>
          <div class="orbital-card-desc">${item.desc}</div>
          <div class="orbital-card-content">${item.content}</div>
          <div class="orbital-card-energy">
            <div class="orbital-card-energy-label">
              <span>Energy Level</span>
              <span>${item.energy}%</span>
            </div>
            <div class="orbital-card-energy-bar">
              <div class="orbital-card-energy-fill" style="width: ${item.energy}%"></div>
            </div>
          </div>
        </div>
      `;

      return node;
    }

    getStatusText(status) {
      const statusMap = {
        'completed': 'ABGESCHLOSSEN',
        'in-progress': 'IN ARBEIT',
        'pending': 'GEPLANT'
      };
      return statusMap[status] || status.toUpperCase();
    }

    calculateNodePosition(index, total) {
      const angle = ((index / total) * 360 + this.rotationAngle) % 360;

      // Responsive radius based on viewport width
      let radius = 180; // Desktop default
      if (window.innerWidth <= 600) {
        radius = 120; // Mobile
      } else if (window.innerWidth <= 900) {
        radius = 160; // Tablet
      }
      if (window.innerWidth <= 400) {
        radius = 100; // Very small mobile
      }

      const radian = (angle * Math.PI) / 180;

      const x = radius * Math.cos(radian);
      const y = radius * Math.sin(radian);

      // Calculate z-index based on position (nodes in front have higher z-index)
      const zIndex = Math.round(100 + 50 * Math.cos(radian));

      // Calculate opacity - all nodes fully visible
      const opacity = 1;

      return { x, y, angle, zIndex, opacity };
    }

    updateNodePositions() {
      const totalNodes = this.data.length;

      this.nodes.forEach(({ element, data }, index) => {
        const position = this.calculateNodePosition(index, totalNodes);
        const isActive = this.activeNodeId === data.id;

        // Apply transform directly
        element.style.transform = `translate(${position.x}px, ${position.y}px)`;
        element.style.zIndex = isActive ? 200 : position.zIndex;
        element.style.opacity = isActive ? 1 : position.opacity;

        // Force visibility
        element.style.display = 'block';
        element.style.position = 'absolute';
      });
    }

    startRotation() {
      const rotate = () => {
        if (this.autoRotate) {
          this.rotationAngle = (this.rotationAngle + 0.3) % 360;
          this.updateNodePositions();
        }
        this.animationFrameId = requestAnimationFrame(rotate);
      };
      rotate();
    }

    stopRotation() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    }

    setupEventListeners() {
      // Node click handlers
      this.nodes.forEach(({ element, data }) => {
        element.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleNode(data.id);
        });
      });

      // Click outside to close
      this.container.addEventListener('click', (e) => {
        if (e.target === this.container || e.target.closest('.orbital-viewport')) {
          this.closeAllNodes();
        }
      });

      // Resize handler - update positions on window resize
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.updateNodePositions();
        }, 100);
      });
    }

    toggleNode(nodeId) {
      if (this.activeNodeId === nodeId) {
        this.closeAllNodes();
      } else {
        this.openNode(nodeId);
      }
    }

    openNode(nodeId) {
      // Close previous
      this.closeAllNodes();

      // Open new
      this.activeNodeId = nodeId;
      this.autoRotate = false;

      const activeNode = this.nodes.find(n => n.data.id === nodeId);
      if (!activeNode) return;

      // Mark as active
      activeNode.element.classList.add('is-active');

      // Mark related nodes
      const relatedIds = activeNode.data.relatedIds || [];
      this.nodes.forEach(({ element, data }) => {
        if (relatedIds.includes(data.id)) {
          element.classList.add('is-related');
        }
      });

      // Hide center when card is open
      this.container.classList.add('has-active-card');

      // Center the active node
      this.centerViewOnNode(nodeId);
    }

    closeAllNodes() {
      this.activeNodeId = null;
      this.autoRotate = true;

      this.nodes.forEach(({ element }) => {
        element.classList.remove('is-active', 'is-related');
      });

      // Show center again
      this.container.classList.remove('has-active-card');
    }

    centerViewOnNode(nodeId) {
      const nodeIndex = this.data.findIndex(item => item.id === nodeId);
      if (nodeIndex === -1) return;

      const totalNodes = this.data.length;
      const targetAngle = (nodeIndex / totalNodes) * 360;

      // Rotate to position node at bottom (270 degrees)
      this.rotationAngle = 270 - targetAngle;
      this.updateNodePositions();
    }

    destroy() {
      this.stopRotation();
      this.nodesContainer.innerHTML = '';
      this.nodes = [];
    }
  }

  // Initialize when DOM is ready
  function initOrbitalTimeline() {
    if (document.getElementById('orbitalTimeline')) {
      // Use SERVICE_DATA if available, otherwise fallback to hardcoded data
      const serviceData = window.SERVICE_DATA || window.SERVICE_CONTENT?.[document.body.dataset.service];
      new OrbitalTimeline('orbitalTimeline', serviceData);
    }
  }

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOrbitalTimeline);
  } else {
    initOrbitalTimeline();
  }

  // Export for manual initialization if needed
  window.OrbitalTimeline = OrbitalTimeline;

})();
