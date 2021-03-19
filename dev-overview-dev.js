import { d as defineStanzaElement } from './stanza-element-b0afeab3.js';
import './index-b010e6ef.js';
import { g as getFormatedJson, s as select } from './metastanza_utils-6810f372.js';
import './timer-be811b16.js';

async function devOverviewDev(stanza, params) {
  stanza.render({
    template: "stanza.html.hbs",
    parameters: {},
  });

  const apis = JSON.parse(params.apis);

  draw(stanza.root.querySelector("#chart"), apis);
}

async function draw(element, apis) {
  const labelMargin = 100;
  const width = 700;
  const height = 50;

  const dataset = {};
  for (const api of apis) {
    dataset[api] = await getFormatedJson(api, element);
  }

  let body = {};

  for (let id = 0; id < apis.length; id++) {
    const api = apis[id];
    // first render
    const div = select(element)
      .append("div")
      .attr("id", "div_" + id)
      .attr("class", "bar");
    const svg = div
      .append("svg")
      .attr("width", width + labelMargin)
      .attr("height", height);
    svg
      .append("text")
      .attr("x", 0)
      .attr("y", height / 2)
      .attr("alignment-baseline", "central")
      .text(
        dataset[api].type.charAt(0).toUpperCase() + dataset[api].type.slice(1)
      );

    dataset[api].data = setData(dataset[api].data, width, height, labelMargin);
    dataset[api].id = id;

    svg.attr("id", "svg_" + dataset[api].type.replace(/\s/g, "_"));
    svg
      .selectAll("rect")
      .data(dataset[api].data)
      .enter()
      .append("rect")
      .attr("x", function (d) {
        return d.barStart;
      })
      .attr("y", 0)
      .attr("width", function (d) {
        return d.barWidth;
      })
      .attr("height", height)
      .attr("id", function (d) {
        return d.onclick_list[0].id;
      })
      .attr("class", function (d, i) {
        if (d.label !== "None") {
          return "bar-style-" + i;
        }
        return "bar-style-na";
      })
      .on("mouseover", function (e, d) {
        svg
          .append("text")
          .attr("id", d.onclick_list[0].id)
          .text(d.label + ": " + d.count + "/" + d.origCount)
          .attr("x", function () {
            const x = d.barStart + d.barWidth / 2;
            const left = x - this.getBBox().width / 2;
            const right = x + this.getBBox().width / 2;
            if (left > labelMargin + 10 && right < labelMargin + width - 10) {
              d.textAnchor = "middle";
              return x;
            } else if (left < labelMargin + 10) {
              d.textAnchor = "start";
              return labelMargin + 10;
            }
            d.textAnchor = "end";
            return labelMargin + width - 10;
          })
          .attr("y", height / 2)
          .attr("text-anchor", d.textAnchor)
          .attr("dominant-baseline", "central");
      })
      .on("mouseout", function (e, d) {
        svg.select("text#" + d.onclick_list[0].id).remove();
      })
      .on("click", async function (e, d) {
        // re-render
        const key = dataset[api].type.replace(/\s/g, "_");
        body[key] = d.onclick_list[0].id;

        for (const api of apis) {
          getDataAndRender(element, api, body, dataset);
        }
      });
  }

  const initDataset = JSON.parse(JSON.stringify(dataset));
  select(element)
    .append("p")
    .html("&gt; Reset")
    .style("cursor", "pointer")
    .on("click", function () {
      // reset-render
      body = {};

      for (const api of apis) {
        dataset[api].data = changeData(
          dataset[api].data,
          JSON.parse(JSON.stringify(initDataset[api].data)),
          width,
          height,
          labelMargin
        );
        reRender(element, dataset[api]);
      }
    });

  async function getDataAndRender(element, api, body, dataset) {
    const newData = await getFormatedJson(
      api,
      element.querySelector("#div_" + dataset[api].id),
      body
    );
    dataset[api].data = changeData(
      dataset[api].data,
      newData.data,
      width,
      height,
      labelMargin
    );
    reRender(element, dataset[api]);
  }

  function reRender(element, dataset) {
    const svg = select(element)
      .select("#svg_" + dataset.type.replace(/\s/g, "_"));
    svg
      .selectAll("rect")
      .data(dataset.data)
      .transition()
      .delay(200)
      .duration(1000)
      .attr("x", function (d) {
        return d.barStart;
      })
      .attr("width", function (d) {
        return d.barWidth;
      });
  }

  function setData(data, width, height, labelMargin) {
    let total = 0;
    for (const category of data) {
      total += parseFloat(category.count);
    }

    let start = labelMargin;
    for (let i = 0; i < data.length; i++) {
      let barWidth = (width * parseFloat(data[i].count)) / total;
      if (data.length - 1 === i) {
        barWidth = width - start + labelMargin;
      }
      data[i].barStart = start;
      data[i].barWidth = barWidth;
      start += barWidth;
    }
    data.push({
      label: "None",
      count: "0",
      barStart: width + labelMargin,
      barWidth: 0,
      onclick_list: [{ id: "n-a" }],
    });
    return data;
  }

  function changeData(data, newData, width, height, labelMargin) {
    let total = 0;
    const label2data = {};
    if (!newData[0]) {
      newData = [
        {
          label: "None",
          count: "1",
          onclick_list: [{ id: "n-a" }],
        },
      ];
    }
    for (const category of newData) {
      total += parseFloat(category.count);
      label2data[category.label] = category;
    }
    let start = labelMargin;
    for (let i = 0; i < data.length; i++) {
      if (label2data[data[i].label]) {
        data[i] = label2data[data[i].label];
      } else {
        data[i].count = 0;
      }
      let barWidth = (width * parseFloat(data[i].count)) / total;
      if (data.length - 1 === i) {
        barWidth = width - start + labelMargin;
      }
      data[i].barStart = start;
      data[i].barWidth = barWidth;
      start += barWidth;
    }
    return data;
  }
}

var metadata = {
	"@context": {
	stanza: "http://togostanza.org/resource/stanza#"
},
	"@id": "dev-overview-dev",
	"stanza:label": "dev Overview dev",
	"stanza:definition": "",
	"stanza:type": "MetaStanza",
	"stanza:display": "Chart",
	"stanza:provider": "TogoStanza",
	"stanza:license": "MIT",
	"stanza:author": "TogoStanza",
	"stanza:address": "admin@biohackathon.org",
	"stanza:contributor": [
],
	"stanza:created": "2020-11-04",
	"stanza:updated": "2020-11-04",
	"stanza:parameter": [
	{
		"stanza:key": "apis",
		"stanza:example": "[\"https://db-dev.jpostdb.org/rest/api/stat_chart_filtering?type=species\", \"https://db-dev.jpostdb.org/rest/api/stat_chart_filtering?type=organ\", \"https://db-dev.jpostdb.org/rest/api/stat_chart_filtering?type=disease\", \"https://db-dev.jpostdb.org/rest/api/stat_chart_filtering?type=sample_type\", \"https://db-dev.jpostdb.org/rest/api/stat_chart_filtering?type=cell_line\", \"https://db-dev.jpostdb.org/rest/api/stat_chart_filtering?type=modification\", \"https://db-dev.jpostdb.org/rest/api/stat_chart_filtering?type=instrument\"]",
		"stanza:description": "api list",
		"stanza:required": true
	}
],
	"stanza:about-link-placement": "bottom-right",
	"stanza:style": [
	{
		"stanza:key": "--series-0-color",
		"stanza:type": "color",
		"stanza:default": "#ffa8a8",
		"stanza:description": "bar color"
	},
	{
		"stanza:key": "--series-1-color",
		"stanza:type": "color",
		"stanza:default": "#ffffa8",
		"stanza:description": "bar color"
	},
	{
		"stanza:key": "--series-2-color",
		"stanza:type": "color",
		"stanza:default": "#a8ffa8",
		"stanza:description": "bar color"
	},
	{
		"stanza:key": "--series-3-color",
		"stanza:type": "color",
		"stanza:default": "#a8ffff",
		"stanza:description": "bar color"
	},
	{
		"stanza:key": "--series-4-color",
		"stanza:type": "color",
		"stanza:default": "#a8a8ff",
		"stanza:description": "bar color"
	},
	{
		"stanza:key": "--series-5-color",
		"stanza:type": "color",
		"stanza:default": "#ffa8ff",
		"stanza:description": "bar color"
	},
	{
		"stanza:key": "--series-6-color",
		"stanza:type": "color",
		"stanza:default": "#ffd3a8",
		"stanza:description": "bar color"
	},
	{
		"stanza:key": "--series-7-color",
		"stanza:type": "color",
		"stanza:default": "#d3ffa8",
		"stanza:description": "bar color"
	},
	{
		"stanza:key": "--series-8-color",
		"stanza:type": "color",
		"stanza:default": "#a8ffd3",
		"stanza:description": "bar color"
	},
	{
		"stanza:key": "--series-9-color",
		"stanza:type": "color",
		"stanza:default": "#a8d3ff",
		"stanza:description": "bar color"
	}
]
};

var templates = [
  ["stanza.html.hbs", {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<h1>\n  Overview\n</h1>\n<div id=\"chart\"></div>";
},"useData":true}]
];

var css = "main {\n  padding: 1rem 2rem;\n}\n\np.greeting {\n  margin: 0;\n  font-size: 24px;\n  color: var(--greeting-color);\n  text-align: var(--greeting-align);\n}\n\ndiv#chart {\n  position: relative;\n}\n\ndiv.bar {\n  position: relative;\n}\n\n.bar-style-na {\n  fill: #dddddd;\n}\n\n.bar-style-0 {\n  fill: var(--series-0-color);\n}\n\n.bar-style-1 {\n  fill: var(--series-1-color);\n}\n\n.bar-style-2 {\n  fill: var(--series-2-color);\n}\n\n.bar-style-3 {\n  fill: var(--series-3-color);\n}\n\n.bar-style-4 {\n  fill: var(--series-4-color);\n}\n\n.bar-style-5 {\n  fill: var(--series-5-color);\n}\n\n.bar-style-6 {\n  fill: var(--series-6-color);\n}\n\n.bar-style-7 {\n  fill: var(--series-7-color);\n}\n\n.bar-style-8 {\n  fill: var(--series-8-color);\n}\n\n.bar-style-9 {\n  fill: var(--series-9-color);\n}";

defineStanzaElement(devOverviewDev, {metadata, templates, css, url: import.meta.url});
//# sourceMappingURL=dev-overview-dev.js.map
