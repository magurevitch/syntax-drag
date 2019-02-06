var mode = {};

function dropSwitch(closest) {
  newcloseX = trace ? trace.x : selectedNode.interaction().x;
  newcloseY = trace ? trace.y : selectedNode.interaction().y;

  selectedNode.setLocation(closest.x, closest.y);
  closest.setLocation(newcloseX,newcloseY);

  var parent = closest.isAncestor(selectedNode.interaction()) ? closest : closest.parent;
  closest.parent = selectedNode.interaction().isAncestor(closest) ? selectedNode.interaction() : selectedNode.interaction().parent;
  selectedNode.interaction().parent = parent;
}

function dropChild(closest) {
  if (closest.isAncestor(selectedNode.interaction())) {
    closest.parent = null;
  }

  selectedNode.interaction().parent = closest;
  if(trace) {
    selectedNode.setLocation(trace.x, trace.y);
  }
}

function dropDependency(closest) {
  selectedNode.interaction().links = selectedNode.interaction().links || [];
  selectedNode.interaction().links.push(closest);
  selectedNode.setLocation(trace.x, trace.y);
}

function treeHelper(closest) {
  if (!closest.parent || closest.parent === selectedNode.interaction()) {
    newX = 1/2 * (selectedNode.interaction().x + closest.x);
    newY = 1/2 * (selectedNode.interaction().y + closest.y) - 20;
    node = new Node(newX, newY, $('#parentText').val());
    nodes.push(node);
    closest.parent = node;
  }
  selectedNode.interaction().parent = closest.parent;
}

function dropTree(closest) {
  treeHelper(closest);
  if(trace) {
    selectedNode.setLocation(trace.x, trace.y);
  }
}

function dropMovement(closest) {
  if (selectedNode.interaction().parent && selectedNode.interaction().parent !== closest.parent) {
    traceNode = trace || new Node(selectedNode.interaction().x+10, selectedNode.interaction().y+10, "trace");

    nodes.forEach(node => {
      var index = node.links ? node.links.indexOf(selectedNode.interaction()) : -1;
      if(index >= 0) {
        node.links[index] = traceNode;
      }
    });

    traceNode.ghosted = false;
    traceNode.parent = selectedNode.interaction().parent;
    traceNode.links = traceNode.links || [];
    traceNode.links.push(selectedNode.interaction());
    nodes.push(traceNode);
  }
  treeHelper(closest);
}

function findChildren() {
  var children = {};
  nodes.forEach(node => {
    if(node.parent) {
      index=nodes.indexOf(node.parent);
      children[index] = children[index] || [];
      sortedInsert(children[index],node,item=>item.x);
    }
  });
  return children;
}

function makeBinary() {
  var children = findChildren();
  for(index in children) {
    node = nodes[index];
    childNodes = children[index];
    while(childNodes.length > 2) {
      var nodeToMove = childNodes.pop();
      node = new Node(node.x+10,node.y+10,node.text,node);
      nodes.push(node);
      childNodes.forEach(child => {
        child.parent = node;
      });
    }
  }
}
