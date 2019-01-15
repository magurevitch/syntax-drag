function draw() {
  c.clearRect(0, 0, canvas.get(0).width, canvas.get(0).height);
  if (trace) {
    trace.draw();
  }
  nodes.forEach(node => {
    node.x += node.velocityX;
    node.y += node.velocityY;

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

    if(node.links) {
      node.links.forEach(link => {
        factor = node.parent || link.parent ? 1 : -1;

        c.beginPath();
        c.setLineDash([]);
        c.lineWidth = 1;
        c.moveTo(node.x, node.y);
        c.bezierCurveTo(node.x, node.y+factor*30, link.x, link.y+factor*30, link.x, link.y+factor*5);
        c.lineTo(link.x-5,link.y+factor*10);
        c.lineTo(link.x+5,link.y+factor*10);
        c.lineTo(link.x,link.y+factor*5);
        c.stroke();
      });
    }
    node.draw();
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
      dist = Math.sqrt(distSq);

      force = (sameTree(node, nodeTwo) ? 4 : 1) / distSq;
      node.velocityX -= force * xDist/dist;
      node.velocityY -= force * yDist/dist;
      nodeTwo.velocityX += force * xDist/dist;
      nodeTwo.velocityY += force * yDist/dist;

      //be on same line
      yDist = nodeTwo.y-node.y;
      force = 0.001 / yDist*yDist*yDist || 0;
      node.velocityY += force;
      nodeTwo.velocityY -= force;

      //don't scramble order
      if(node.leaf && nodeTwo.leaf && sameTree(node, nodeTwo)) {
        xDist = nodeTwo.x-node.x;
        force = 0.1 / xDist || 0;
        node.velocityX -= force;
        nodeTwo.velocityX += force;
      }
    }
  }
}

draw();
