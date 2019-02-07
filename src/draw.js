function draw() {
  c.clearRect(0, 0, canvas.get(0).width, canvas.get(0).height);
  if (trace) {
    trace.draw();
  }

  if(closestNode) {
    closestNode.highlight('yellow');
  }

  if(selectedNode) {
    selectedNode.highlight('red');
  }

  nodes.forEach(node => {
    if(mode['animation Forces'] && node !== selectedNode){
			//speed limit 1
			sqSpeed = node.velocityX*node.velocityX + node.velocityY*node.velocityY;
			if (sqSpeed > 1) {
				speed = Math.sqrt(sqSpeed);
				node.velocityX /= sqSpeed;
				node.velocityY /= sqSpeed;
			}

      node.x += node.velocityX;
      node.y += node.velocityY;
    }

    //drag
    factor = node.velocityX / Math.abs(node.velocityX) || 0;
    node.velocityX -= factor * 0.1 * node.velocityX*node.velocityX;
    factor = node.velocityY / Math.abs(node.velocityY) || 0;
    node.velocityY -= factor * 0.1 * node.velocityY*node.velocityY;


    if(node.parent) {
      c.beginPath();
      c.setLineDash([]);
      c.lineWidth = 3;
      c.moveTo(node.x, node.y-5);
      c.lineTo(node.parent.x, node.parent.y);
      c.stroke();
    }
  });

  nodes.concat(leaves).forEach(node => {
    node.draw();
    if(node.links) {
      node.links.forEach(link => {
        factor = node.parent || link.parent ? 1 : -1;

        c.beginPath();
        c.setLineDash([]);
        c.lineWidth = 1;
        c.moveTo(node.getLocation().x, node.getLocation().y);
        c.bezierCurveTo(node.getLocation().x, node.getLocation().y+factor*30, link.getLocation().x, link.getLocation().y+factor*30, link.getLocation().x, link.getLocation().y+factor*5);
        c.lineTo(link.getLocation().x-5,link.getLocation().y+factor*10);
        c.lineTo(link.getLocation().x+5,link.getLocation().y+factor*10);
        c.lineTo(link.getLocation().x,link.getLocation().y+factor*5);
        c.stroke();
      });
    }
  });

  if(mode['animation Forces']){
    resolveForces();
  }
  window.requestAnimationFrame(draw);
}

function resolveForces() {
  centerX = canvas.get(0).width/2;
  centerY = canvas.get(0).height/2;
  for(var i=0; i < nodes.length; i++) {
    node = nodes[i];

    //center is spring
    k = 0.00001;
    node.velocityX -= k * (node.x - centerX);
    node.velocityY -= k * (node.y - centerY);
    if(node.parent) {
      //connection is spring
      xDist = node.parent.x-node.x;
      yDist = node.parent.y-node.y;
      dist = Math.sqrt(xDist*xDist + yDist*yDist);

      deltaZ = 35 - dist;
      force = 0.005 * deltaZ;
      node.velocityX -= force * xDist/dist;
      node.velocityY -= force * yDist/dist;
      node.parent.velocityX += force * xDist/dist;
      node.parent.velocityY += force * yDist/dist;

      //pressure to put parent on top
      yDist = node.parent.y-node.y;
      node.velocityY += 0.1 * Math.exp(0.01 * yDist);
      node.parent.velocityY -= 0.1 * Math.exp(0.01 * yDist);

    }
    for(var j=i+1; j < nodes.length; j++) {
      nodeTwo = nodes[j];

      //repulsion
      xDist = nodeTwo.x-node.x;
      yDist = nodeTwo.y-node.y;
      distSq = xDist*xDist + yDist*yDist;
			if(distSq){
      	dist = Math.sqrt(distSq);

      	force = (sameTree(node, nodeTwo) ? 4 : 2) / distSq;
      	node.velocityX -= force * xDist/dist;
      	node.velocityY -= force * yDist/dist;
      	nodeTwo.velocityX += force * xDist/dist;
      	nodeTwo.velocityY += force * yDist/dist;
			}

      //be on same line
      yDist = nodeTwo.y-node.y;
      force = 0.0001 / yDist*yDist*yDist || 0;
      node.velocityY += force;
      nodeTwo.velocityY -= force;
    }
  }

  //keep leaf order intact
  var remainingLeaves = [];
  var notInTree = leaves.filter(x => x !== selectedNode && x.parent !== selectedNode).map(x => x.parent);
  var currentNode = null;
  while(remainingLeaves.length + notInTree.length) {
    if(remainingLeaves.length) {
      secondNode = remainingLeaves.shift();
      if(sameTree(currentNode,secondNode)) {
        dist = secondNode.x - currentNode.x;
        deltaZ = 35 - dist;
        force = 0.01 * deltaZ;
        currentNode.velocityX -= force;
        secondNode.velocityX += force;
        currentNode = secondNode;
      } else {
        notInTree.push(secondNode);
      }
    } else {
      currentNode = notInTree.shift();
      remainingLeaves = notInTree;
      notInTree = [];
    }

  }

  if(mode['leaves in a Row']) {
    updateLowNode();
  }
}

draw();
