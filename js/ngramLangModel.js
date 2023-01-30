var ngramlm = (function(){
  const ngram = 3;

  var data = {
    name: 'Hidden Root',
    num: 1,
    id: 'idRoot',
    children: []
  };

  // because the real root is hidden, so `left` is negative
  const margin = {top: 20, right: 90, bottom: 30, left: -50};
  const width = 600 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  var svg = d3.select("#ngramtree").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var i = 0, duration = 750, root;
  var mytree = d3.tree().size([height, width]);
  root = d3.hierarchy(data, function(d) {
    return d.children;
  });
  root.x0 = height / 2;
  root.y0 = 0;

  function update(source) {
    var treeData = mytree(root);

    var nodes = treeData.descendants();
    var links = treeData.descendants().slice(1);

    nodes.forEach(function(d) {
      d.y = d.depth * 180
    });

    var link = svg.selectAll('line.link')
      .data(links, function(d) {
        return d.id;
      });

    var linkEnter = link.enter()
      .append('line')
      .attr("class", "link")
      .attr("stroke-width", function(d) {
        if (d.depth == 1) {
          return 0;
        } else {
          return 2;
        }
      })
      .attr("stroke", 'black')
      .attr('x1', function(d) {
        return source.y0;
      })
      .attr('y1', function(d) {
        return source.x0;
      })
      .attr('x2', function(d) {
        return source.y0;
      })
      .attr('y2', function(d) {
        return source.x0;
      });
      
    var linkUpdate = linkEnter.merge(link);
    
    linkUpdate.transition()
      .duration(duration)
      .attr('x1', function(d) {
        return d.parent.y;
      })
      .attr('y1', function(d) {
        return d.parent.x;
      })
      .attr('x2', function(d) {
        return d.y;
      })
      .attr('y2', function(d) {
        return d.x;
      });

    linkUpdate.transition()
      .duration(duration)
      .attr('x1', function(d) {
        return d.parent.y;
      })
      .attr('y1', function(d) {
        return d.parent.x;
      })
      .attr('x2', function(d) {
        return d.y;
      })
      .attr('y2', function(d) {
        return d.x;
      });

    var linkExit = link.exit()
      .transition()
      .duration(duration)
      .attr('x1', function(d) {
        return source.x;
      })
      .attr('y1', function(d) {
        return source.y;
      })
      .attr('x2', function(d) {
        return source.x;
      })
      .attr('y2', function(d) {
        return source.y;
      });

    var node = svg.selectAll('g.node')
      .data(nodes, function(d) {
        return d.id || (d.id = ++i);
      });

    var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
      });

    nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 15)
      .style("fill", function(d) {
        if (d.depth == 0) {
          return "#FFFFFF";
        } else {
          return "#FF0000";
        }
      });

    nodeEnter.append("text")
      .attr("y", function(d) { 
        return d.children || d._children ? -18 : 18; })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("id", function(d) {
        return `txt${d.id}`;
      })
      .text(function(d) { 
        // console.log(d.depth);
        if (d.depth == 0) {
          return "";
        } else if (d.depth == ngram) {
          return `${d.data.name}: ${d.data.num}`;
        } else {
          return d.data.name;
        }
      })
      .style("fill-opacity", 1);

    var nodeUpdate = nodeEnter.merge(node);
    nodeUpdate.transition().duration(duration)
      .attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
      });

    nodeUpdate.select('circle.node')
      .attr('r', 15)
      .attr('id', function(d) {
        return `circle${d.id}`;
      })
      .style("fill", function(d) {
        if (d.depth == 0) {
          return "#FFFFFF";
        } else {
          return "#FF0000";
        }
      })
      .attr('cursor', 'pointer');

    var nodeExit = node.exit().transition().duration(duration)
      .attr("transform", function(d) {
        return "translate(" + source.y + "," + source.x + ")";
      });

    nodeExit.select('circle').attr('r', 0);
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  function searchTree(obj, search, depth, parent) {
    // console.log(obj);
    if (obj.data.name === search && 
      obj.depth == depth && 
      obj.parent.data.name == parent.data.name) { 
      return obj;
    } else if (obj.children) {
      var children = obj.children;
      for (var i=0;i<children.length;i++) {
        var found = searchTree(children[i], search, depth, parent);
        if (found) {
          return found;
        }
      }
    } else {
      return null;
    }
  }

  function addNewNode(selected, target) {
    console.log(selected);
    
    const idNode = `id${getRandomInt(Date.now())}`;
    var newNodeObj = {
      name: target,
      num: 1,
      id: idNode,
      children: []
    };
    
    var newNode = d3.hierarchy(newNodeObj);
    newNode.depth = selected.depth + 1; 
    newNode.height = selected.height - 1;
    newNode.parent = selected;
    newNode.id = idNode;
    
    if(!selected.children) {
      selected.children = [];
      selected.data.children = [];
    }
    selected.children.push(newNode);
    selected.data.children.push(newNode.data);
    
    update(selected);
  };

  function searchTree(obj, search, depth, parent) {
    // console.log(obj);
    if (obj.data.name === search && 
      obj.depth == depth && 
      obj.parent.data.name == parent.data.name) { 
      return obj;
    } else if (obj.children) {
      var children = obj.children;
      for (var i=0;i<children.length;i++) {
        var found = searchTree(children[i], search, depth, parent);
        if (found) {
          return found;
        }
      }
    } else {
      return null;
    }
  }

  let publicScope = {};
  publicScope.gogogogo = async function() {
    const n = ngram;
    var ori = [
      "I am good [END]",
      "I can fly [END]",
      "I can fly high [END]"
    ];
    
    for (var i=0; i<ori.length; i++) {
      // TODO: check is it n-2
      for (var j=0; j<n-2; j++) {
        ori[i] = "[START] " + ori[i];
      }
    }

    var text = [];
    for (var i=0; i<ori.length; i++) {
      text.push(ori[i].split(" "));
    }

    for (var i=0; i<text.length; i++) {
      for (var j=0; j<=text[i].length-n; j++) {
        var curr = root;
        for (var k=0; k<n; k++) {
          var target = text[i][j+k];
          var children = curr.data.children;
          var next = null;
          for (var c=0; c<children.length; c++) {
            if (children[c].name == target) { // Found!!!
              next = searchTree(curr, target, k+1, curr);
              
              if (k === n-1) { // leaf node
                next.data.num = next.data.num + 1;
                svg.select(`text#txt${next.id}`).text(`${next.data.name}: ${next.data.num}`);
              }

              break;
            }
          }

          if (next == null) {
            addNewNode(curr, target);
            next = searchTree(curr, target, k+1, curr);
          }

          curr = next;

          await sleep(duration);
        }
      }
    }

    document.getElementById('langmodel').disabled = false;
    document.getElementById('goBtn').disabled = true;
  }

  publicScope.findNode = function() {
    const typing = "[START] " + document.getElementById("langmodel").value;
    const nodes = typing.trim().split(" ");
    const target = nodes.slice(Math.max(nodes.length - ngram + 1, 0))
    // console.log(target);

    svg.selectAll("circle").style("fill", "#FF0000");

    var foundLeaves = null;
    var curr = root.data.children;
    for (var i=0; i<target.length; i++) {
      // console.log(target[i]);
      var foundChild = null;
      for (var j=0; j<curr.length; j++) {
        // console.log(curr[j]);
        if (target[i] == curr[j].name) {
          foundChild = curr[j];
          svg.select(`circle#circle${foundChild.id}`).style("fill", "#0000FF");
          break;
        }
      }

      if (foundChild != null) {
        if (i == target.length-1) {
          foundLeaves = foundChild.children;
        } else {
          curr = foundChild.children;
        }
      } else {
        break;
      }
    }

    if (foundLeaves != null) {
      // console.log(foundLeaves);
      const sum = foundLeaves.map(x => x.num).reduce((a, b) => a + b, 0);
      // console.log(sum);

      document.getElementById("prediction").innerHTML = "";
      var prediction = "The next word probability:<br><table border='1'><thead><tr><td>word</td><td>probability</td></tr></thead><tbody>";
      for (var i=0; i<foundLeaves.length; i++) {
        prediction += `<tr><td>${foundLeaves[i].name}</td><td>${foundLeaves[i].num/sum}</td></tr>`;
      }
      prediction += "</tbody></table>";
      document.getElementById("prediction").innerHTML = prediction;
    } else {
      document.getElementById("prediction").innerHTML = "";
    }
  }

  publicScope.init = function() {
    update(root);
  }

  return publicScope;
})();
