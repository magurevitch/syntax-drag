canvas.on('mousedown', e => selectNode(e));
canvas.on('mousemove', e => moveSelected(e))
canvas.on('mouseup', e => dropSelected(e));
canvas.on('mouseleave', e => deleteSelected(e))

var selectedNode = null;
var trace = null;
var closestNode = null;

function selectNode(event) {
    selectedNode = findClosest(event.offsetX, event.offsetY);

    if (!selectedNode) {
      selectedNode = mode['create'](event.offsetX, event.offsetY,$('#node').val());
      nodes.push(selectedNode);
    }

    trace = new Node(selectedNode.x, selectedNode.y, "trace");
    trace.ghosted = true;
    selectedNode.ghosted = true;
}

function moveSelected(event) {
  closestNode = findClosest(event.offsetX, event.offsetY);

  if(selectedNode) {
    selectedNode.x = event.offsetX;
    selectedNode.y = event.offsetY;
  }
}

function dropSelected(event) {
    if (selectedNode) {
      closest = findClosest(event.offsetX, event.offsetY);
      if (closest) {
        mode['move'](closest);
      }
      trace = null;
      selectedNode.ghosted = false;
      selectedNode = null;
    }

    if(mode['Binary trees']){
      makeBinary();
    }
}

function deleteSelected(event) {
  nodes = nodes.filter(e => e !== selectedNode);
  nodes.forEach(node => {
    if(node.parent === selectedNode) {
      node.parent = null;
    }
    if(node.links) {
      node.links = node.links.filter(e => e !== selectedNode);
    }
  });

  selectedNode = null;
  trace = null;
}

function findClosest(x, y) {
  var distance = null;
  var closest = null;

  nodes.forEach(node => {
    var sqDistance = (x - node.x) * (x - node.x) + 4 * (y - node.y) * (y - node.y);
    var comparator = distance || 1600;
    if (node !== selectedNode && sqDistance < comparator) {
      distance = sqDistance;
      closest = node;
    }
  });
  return closest;
}
