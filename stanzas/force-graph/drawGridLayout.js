import * as d3 from "d3";

export default function () {
  const nodes = this[Symbol.for("nodes")];
  const edges = this[Symbol.for("edges")];

  const root = this.root.querySelector(":scope > div");

  const width = parseInt(this.params["width"]) || 300;
  const height = parseInt(this.params["height"]) || 200;

  const color = this[Symbol.for("color")];
  const sizeScale = this[Symbol.for("sizeScale")];
  const count = this[Symbol.for("count")];
  const edgeSym = Symbol.for("nodeAdjEdges");

  const svg = d3
    .select(root)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Laying out nodes=========
  const marX = 50;
  const marY = 30;

  let ii = 0;
  let jj = 0;

  const gridSize = Math.ceil(Math.sqrt(nodes.length));

  const dx = (width - 2 * marX) / (gridSize - 1);
  const dy = (height - 2 * marY) / (gridSize - 1);

  nodes.forEach((node) => {
    if (jj < gridSize) {
      node.x = jj * dx;
      node.y = ii * dy;
      jj++;
    } else {
      jj = 0;
      ii++;
      node.x = jj * dx;
      node.y = ii * dy;
      jj++;
    }
  });
  // =========

  const gridG = svg
    .append("g")
    .attr("id", "gridG")
    .attr("transform", `translate(${marX},${marY})`);

  const links = gridG
    .selectAll("path")
    .data(edges)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke-width", (d) => d.weight * 0.5)
    .style("stroke", (d) => color(d.sourceNode.id))
    .style("stroke-opacity", 0.25)
    .style("stroke-linecap", "round")
    .attr("x1", (d) => d.sourceNode.x)
    .attr("y1", (d) => d.sourceNode.y)
    .attr("x2", (d) => d.targetNode.x)
    .attr("y2", (d) => d.targetNode.y);

  const circles = gridG
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("fill", (d) => color(d.id))
    .attr("r", (d) => sizeScale(count[d.id]))
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y);

  circles.on("mouseover", function (e, d) {
    // highlight current node
    d3.select(this).classed("active", true);

    // fade out all other nodes, highlight a little connected ones
    circles
      .classed("fadeout", (p) => d !== p)
      .classed("half-active", (p) => {
        return (
          p !== d &&
          d[edgeSym].some(
            (edge) => edge.sourceNode === p || edge.targetNode === p
          )
        );
      });

    // fadeout not connected edges, highlight connected ones
    links
      .classed("fadeout", (p) => !d[edgeSym].includes(p))
      .classed("active", (p) => d[edgeSym].includes(p));
  });

  circles.on("mouseleave", function () {
    circles
      .classed("active", false)
      .classed("fadeout", false)
      .classed("half-active", false);
    links
      .classed("active", false)
      .classed("fadeout", false)
      .classed("half-active", false);
  });
}
