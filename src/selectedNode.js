var selectedNode = null;
var closestNode = null;
var selectedChildren = [];
var leftSiblings = [];
var rightSiblings = [];

function selectNode(node) {
  if(selectedNode) {
    selectedNode.ghosted = false;
  }
  if(node) {
    node.ghosted = true;
  }
  selectedNode = node;
  emptyFamily();
  if (node) {
    fillFamily();
  }
}

function emptyFamily() {
  selectedChildren = leftSiblings = rightSiblings = [];
}

function fillFamily() {
  var children = findChildren();
  var index = nodes.indexOf(selectedNode);
  selectedChildren = children[index] ? children[index] : [];
  var parentIndex = nodes.indexOf(selectedNode.parent);
  var siblings = children[parentIndex];
  if(siblings) {
    var siblingsIndex = siblings.indexOf(selectedNode);
    leftSiblings = siblings.slice(0,siblingsIndex);
    rightSiblings = siblings.slice(siblingsIndex+1);
  }
  fillSection($('#selectedNode'), selectedNode);
  fillSection($('#parent'), selectedNode.parent);
  fillList($('#children'),selectedChildren);
  fillList($('#left'), leftSiblings);
  fillList($('#right'), rightSiblings);
}

function fillSection(section, object) {
  var text = object ? object.text : '';
  section.text(text);
}

function fillList(section, list) {
  var text = list ? list.map(x => x.text).join(' ') : '';
  section.text(text);
}

function arrowSelect(key) {
  var choice = {
    "ArrowUp": selectedNode ? selectedNode.parent : null,
    "ArrowRight": rightSiblings[0],
    "ArrowLeft": leftSiblings[leftSiblings.length - 1],
    "ArrowDown": selectedChildren[0]
  }
  
  selectNode(choice[key]);
}
