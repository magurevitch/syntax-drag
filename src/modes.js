var mode = {};

function dropSelect(closest) {
  selectedNode.x = closest.x;
  selectedNode.y = closest.y;
  closest.x = trace.x;
  closest.y = trace.y;
}

function dropCatenary(closest) {
  selectedNode.parent = closest;
  selectedNode.x = trace.x;
  selectedNode.y = trace.y;
}

function dropDependency(closest) {
  selectedNode.links = selectedNode.links || [];
  selectedNode.links.push(closest);
  selectedNode.x = trace.x;
  selectedNode.y = trace.y;
}

function dropTree(closest) {
  if (!closest.parent || closest.parent === selectedNode) {
    newX = 1/2 * (selectedNode.x + closest.x);
    newY = 1/2 * (selectedNode.y + closest.y) - 20;
    node = new Node(newX, newY, $('#parent').val());
    nodes.push(node);
    closest.parent = node;
  }
  selectedNode.parent = closest.parent;
}

function dropMovement(closest) {
  if (selectedNode.parent && selectedNode.parent !== closest.parent) {
    nodes.forEach(node => {
      var index = node.links ? node.links.indexOf(selectedNode) : -1;
      if(index >= 0) {
        node.links[index] = trace;
      }
    });

    trace.ghosted = false;
    trace.parent = selectedNode.parent;
    trace.links = trace.links || [];
    trace.links.push(selectedNode);
    nodes.push(trace);
  }
  dropTree(closest);
}

function findChildren() {
  var children = {};
  nodes.forEach(node => {
    if(node.parent) {
      index=nodes.indexOf(node.parent);
      children[index] = children[index] || [];
      children[index].push(node);
    }
  });
  return children;
}

function makeBinary() {
  children = findChildren();

  for(index in children) {
    node = nodes[index];
    childNodes = children[index];
    while(childNodes.length > 2) {
      var nodeToMove = childNodes.pop();
      var newNode = new Node(node.x+10,node.y+10,node.text,node);
      nodes.push(newNode);
      childNodes.forEach(child => {
        child.parent = newNode;
      });
    }
  }
}
