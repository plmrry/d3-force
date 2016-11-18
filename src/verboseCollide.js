import constant from "./constant";
import jiggle from "./jiggle";
import {quadtree} from "d3-quadtree";
import {range, max} from "d3-array";

/* eslint no-console: "off" */

function x(d) {
  return d.x + d.vx;
}

function y(d) {
  return d.y + d.vy;
}

export default function(radius) {
  var nodes,
      strength = 1,
      iterations = 1;

  function force() {

    range(iterations).forEach(() => {
      const tree = quadtree(nodes, x, y)
        .visitAfter(function prepare(quad) {
          if (quad.data) {
            return quad.r = radius(quad.data);
          }
          quad.r = max(quad, q => q ? q.r : 0);
        });
      nodes.forEach((node, i) => {
        const ri = radius(node);
        const ri2 = ri * ri;
        const xi = node.x + node.vx;
        const yi = node.y + node.vy;
        tree.visit(function apply(quad, x0, y0, x1, y1) {
          var data = quad.data, rj = quad.r, r = ri + rj;
          if (data) {
            if (data.index > i) {
              var x = xi - data.x - data.vx,
                  y = yi - data.y - data.vy,
                  l = x * x + y * y;
              if (l < r * r) {
                if (x === 0) x = jiggle(), l += x * x;
                if (y === 0) y = jiggle(), l += y * y;
                l = (r - (l = Math.sqrt(l))) / l * strength;
                node.vx += (x *= l) * (r = (rj *= rj) / (ri2 + rj));
                node.vy += (y *= l) * r;
                data.vx -= x * (r = 1 - r);
                data.vy -= y * r;
              }
            }
            return;
          }
          return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r;
        });
      })
    })
  }

  force.initialize = function(_) {
    nodes = _;
  };

  force.iterations = function(_) {
    return arguments.length ? (iterations = +_, force) : iterations;
  };

  force.strength = function(_) {
    return arguments.length ? (strength = +_, force) : strength;
  };

  force.radius = function(_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), force) : radius;
  };

  return force;
}
