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
      radii,
      strength = 1,
      iterations = 1;

  if (typeof radius !== "function") radius = constant(radius == null ? 1 : +radius);

  function force() {
    nodes.forEach((d,i) => radii[i] = +radius(nodes[i], i, nodes))

    // let xi,
        // yi;
        // ri2;

    range(iterations).forEach(() => {
      const tree = quadtree(nodes, x, y)
        .visitAfter(function prepare(quad) {
          if (quad.data) return quad.r = radii[quad.data.index];
          quad.r = max(quad, q => q ? q.r : 0);
        });
      nodes.forEach((node, i) => {
        const ri = radii[i]
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
    radii = new Array(nodes.length);
    // for (i = 0; i < n; ++i) radii[i] = +radius(nodes[i], i, nodes);
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
