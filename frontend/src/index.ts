import * as d3 from 'd3';
import type {ScaleOrdinal} from 'd3';

// Types and data
type Intervention = { name: string, mean: number, sd: number };

let interventions = [{ 
    name: 'AI',
    mean: 10,
    sd: 10
  },
  { name: 'Global Poverty',
    mean: 8,
    sd: 2
  },
  { name: 'Biosecurity',
    mean: 15,
    sd: 2
  }
]

function norm_pdf(x: number, mu: number, sigma: number){
  return Math.exp(-(((x - mu) / sigma)**2))/Math.sqrt(2 * Math.PI);
}

type Point = { x: number, y: number};

function norm_to_points(intervention : Intervention, from: number, to: number, step: number){
  let new_points : Point[] = [];
  for(let i = from; i < to; i+= step){
    new_points.push({x : i, y: norm_pdf(i, intervention.mean, intervention.sd)});
  }
  return new_points;
}

// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("body")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

type PointSet = { name : string, points: Point[]}
let from : number = 0;
let to : number = 20;
let step : number = 0.1;

let data : PointSet[] = interventions.map(i => ({'points': norm_to_points(i, from, to, step), 'name': i.name})); 
let all_points = data.flatMap(d => d.points)

  // X axis
var x = d3.scaleLinear()
  .range([ 0, width ])
  .domain(d3.extent(all_points.map(p => p.x)))
let top = Math.ceil(Math.max(...all_points.map(p => p.y)))

// Add Y axis
var y = d3.scaleLinear()
  .domain([0, top])
  .range([ height, 0]);
svg.append("g")
  .call(d3.axisLeft(y));

svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

// Create a Colour Scale
let res : string[] = interventions.map(function(d){ return d.name })
let color : ScaleOrdinal<string, string, never> = d3.scaleOrdinal()
  .domain(res)
  .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999']) as ScaleOrdinal<string,string,never>

// Draw the line plots
svg.selectAll(".line")
  .data(data)
  .enter()
  .append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", function(d): string{ return color(d.name) })
      .attr("stroke-width", 1.5)
      .attr("d", function(d){
        return d3.line()
          .x(function(d) { return x(d[0]); })
          .y(function(d) { return y(d[1]); })
          (d.points.map(p => [p.x, p.y]))
      })


// Recalculate the lines and redraw
function drawChart(){
  let data : PointSet[] = interventions.map(i => ({'points': norm_to_points(i, from, to, step), 'name': i.name})); 

 console.log(interventions)

 let lines = svg.selectAll(".line")
    .data(data)

 lines.attr("d", function(d){
          return d3.line()
            .x(function(d) { return x(d[0]); })
            .y(function(d) { return y(d[1]); })
            (d.points.map(p => [p.x, p.y]))
  });

}

// Controls
let allInterventions = 
    d3.select("body")
      .append("div")
      .attr("class", "intervention-information")

let interventionDetails = allInterventions.selectAll(".intervention")
  .data(interventions)
  .enter()
  .append("div")

// Update intervention data and redraw
function updateChart (intervention_name : string, variable: "mean" | "sd", event: any) {
  interventions = interventions.map(i => {
    if(i.name == intervention_name){
      i[variable] = parseFloat(event.target.value);
    }
    return i;
  });
  drawChart();
}

// Controls and Event Handlers
interventionDetails.append("h1").text(d => d.name)
interventionDetails.append("input")
  .attr("name", d => d.name+ "-mean")
  .attr("value", d => d.mean)
  .on("input", (i, d) => updateChart(d.name, "mean", i))

interventionDetails.append("input")
  .attr("name", d => d.name+ "-sd")
  .attr("value", d => d.sd)
  .on("input", (i, d) => updateChart(d.name, "sd", i))
