canvas.on('mousedown', e => selectNode(e));
canvas.on('mousemove', e => moveSelected(e))
canvas.on('mouseup', e => dropSelected(e));
canvas.on('mouseleave', e => deleteSelected(e))

var selectedNode = null;

function selectNode(event) {
    selectedNode = findClosest(event.pageX, event.pageY);

    if (!selectedNode) {
      selectedNode = mode['create'](event.pageX, event.pageY,$('#node').val());
      nodes.push(selectedNode);
    }

    trace = new Node(selectedNode.x, selectedNode.y, "trace");
    trace.ghosted = true;
    selectedNode.ghosted = true;
    if(mode['Binary trees']){
      makeBinary();
    }
}

function moveSelected(event) {
  if(selectedNode) {
    selectedNode.x = event.pageX;
    selectedNode.y = event.pageY;
  }
}

function dropSelected(event) {
    if (selectedNode) {
      closest = findClosest(event.pageX, event.pageY);
      if (closest) {
        mode['move'](closest);
      }
      trace = null;
      selectedNode.ghosted = false;
      selectedNode = null;
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
    var sqDistance = (x - node.x) * (x - node.x) + 2 * (y - node.y) * (y - node.y);
    var comparator = distance || 900;
    if (node !== selectedNode && sqDistance < comparator) {
      distance = sqDistance;
      closest = node;
    }
  });
  return closest;
}
