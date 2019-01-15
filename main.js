var canvas = $('canvas');
var c = canvas.get(0).getContext('2d');

var nodes = [];
var trace = null;

function Node(x, y, text, parent) {
  this.x = x;
  this.y = y;
  this.velocityX = 0;
  this.velocityY = 0;;

  this.text = text;
  this.parent = parent;

  this.draw = function() {
    c.fillStyle = this.ghosted ? 'gray' : 'black';
    c.textAlign = "center";
    c.fillText(this.text,this.x,this.y)
  }
}

function LeafNode(x, y, text, parent) {
  this.x = x;
  this.y = y;
  this.velocityX = 0;
  this.velocityY = 0;

  this.text = text;
  this.leaf = $('#leaf').val();
  this.parent = parent;

  this.draw = function() {
    c.fillStyle = this.ghosted ? 'gray' : 'black';
    c.textAlign = "center";
    c.fillText(this.text,this.x,this.y)
    c.beginPath();
    c.lineWidth = 1;
    c.setLineDash([3,2]);
    c.moveTo(this.x,this.y);
    c.lineTo(this.x,this.y+25);
    c.stroke();
    c.fillText(this.leaf,this.x,this.y+30)
  }
}

function newXBar(x,y,text){
  phrase = new Node(x, y, text+"P");
  bar = new Node(x, y+30, text+"'",phrase);
  nodes.push(bar);
  head = new LeafNode(x, y+60, text+"0",bar);
  nodes.push(head);
  return phrase;
};

function sameTree(node, nodeTwo) {
  while(node.parent) {
    node = node.parent;
  }
  while(nodeTwo.parent) {
    nodeTwo = nodeTwo.parent;
  }
  return node === nodeTwo;
}
