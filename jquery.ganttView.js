/*
jQuery.ganttView
Copyright (c) 2010 JC Grubbs - jc.grubbs@devmynd.com
Copyright (c) 2015 H. Boers - hboers.me.com
MIT License Applies
*/

/*
Options
-----------------
showWeekends: boolean
data: object
cellWidth: number
cellHeight: number
headerHeight: number
slideWidth: number
resources: array
dataUrl: string
behavior: {
	clickable: boolean,
	draggable: boolean,
	resizable: boolean,
	onClick: function,
	onDrag: function,
	onResize: function
}
*/

(function ( jQuery ) {

    $.fn.ganttView = function(options) {
        var container = jQuery(this);
        var settings = $.extend({
            cellWidth: 81,
            cellHeight: 31,
            headerHeight: 31,
            slideWidth: 600,
            headerWidth: 200,
            rows: [],
            columns: []
        }, options );

        function renderChart() {
          var ganttviewDiv = jQuery("<div>", {"class": "ganttview"});
          var slideDiv = jQuery("<div>", {
            "class": "ganttview-slide-container",
            "css": { "width": settings.slideWidth + "px" }
          });
          addVtHeader(ganttviewDiv);
          addHzHeader(slideDiv);
          addGrid(slideDiv);
          ganttviewDiv.append(slideDiv);
          container.append(ganttviewDiv);
          var w = jQuery("div.ganttview-vtheader").outerWidth()+jQuery("div.ganttview-slide-container").outerWidth();
          ganttviewDiv.css("width",w+"px");

        }

        function addVtHeader(ganttviewDiv) {
          var headerDiv = jQuery("<div>", {
            "class": "ganttview-vtheader",
            "css": {"margin-top": (settings.headerHeight -1) +"px"}
          });
          for (var i = 0; i < settings.rows.length; i++) {
            var itemDiv = jQuery("<div>", { "class": "ganttview-vtheader-item" });
            itemDiv.append(jQuery("<div>", {
                "class": "ganttview-vtheader-item-name",
                "css": { "height":  (settings.cellHeight-1) + "px", "width":  (settings.headerWidth-1) + "px"}
            }).append(settings.rows[i].name));
            headerDiv.append(itemDiv);
          }
          ganttviewDiv.append(headerDiv);
        }

        function addHzHeader(ganttviewDiv) {
          var totalW = settings.columns.length * settings.cellWidth;
          var headerDiv = jQuery("<div>", {
            "class": "ganttview-hzheader",
            "css": {"width": totalW + "px",
            "height": (settings.headerHeight - 1) + "px"}
          });
          var columnsDiv = jQuery("<div>", {
            "class": "ganttview-hzheader-columns"
          });
          for (var i = 0; i < settings.columns.length; i++) {
            var columnDiv = jQuery("<div>", {
              "class": "ganttview-hzheader-column",
              "css": { "width": (settings.cellWidth - 1) +"px"}
            }).append(settings.columns[i].name);
            columnsDiv.append(columnDiv);
          }
          headerDiv.append(columnsDiv);
          ganttviewDiv.append(headerDiv);
        }

        function addGrid(div) {
          var gridDiv = jQuery("<div>", { "class": "ganttview-grid" });
          var rowDiv = jQuery("<div>", { "class": "ganttview-grid-row" });
          for (var i = 0; i < settings.columns.length; i++) {
            var cellDiv = jQuery("<div>", {
              "class": "ganttview-grid-row-cell",
              "css": {
                "width": (settings.cellWidth-1) + "px",
                "height": (settings.cellHeight-1) + "px"
              }
            });
            rowDiv.append(cellDiv);
          }
          var w = jQuery("div.ganttview-grid-row-cell", rowDiv).length * settings.cellWidth;
          rowDiv.css("width", w + "px");
          gridDiv.css("width", w + "px");
          for (var i = 0; i < settings.rows.length; i++) {
              gridDiv.append(rowDiv.clone());
          }
          div.append(gridDiv);
        }

        //addBlocks(slideDiv, opts.data, opts.cellWidth, opts.cellHeight);

        renderChart();

        return this;

    };

}( jQuery ));

/*

(function (jQuery) {


  jQuery.fn.ganttView2 = function () {
    var chart;
    var args = Array.prototype.slice.call(arguments);
  	if (args.length == 1 && typeof(args[0]) == "object") {
     this.chart = build.call(this, args[0]);
     alert (this.chart);

  	}
  	if (args.length == 2 && typeof(args[0]) == "string") {
      switch (args[0]) {
        case "render":
          alert (this.chart);
          render.call(this, args[1],this.chart);
        break;
        case "setSlideWidth":
          setSlideWidth.call(this, args[1]);
        break;
      }
  	}
  };

  function render(value,chart) {
    alert(chart);
  };

  function setSlideWidth(value) {
    var div = $("div.ganttview", this);
    div.each(function () {
      var vtWidth = $("div.ganttview-vtheader", div).outerWidth();
      $(div).width(vtWidth + value + 1);
      $("div.ganttview-slide-container", this).width(value);
    });
  }

  function build(options) {

    var container = jQuery(this);
    var defaults = {
      showWeekends: false,
      cellWidth: 81,
      cellHeight: 31,
      headerHeight: 31,
      slideWidth: 400,
      vHeaderWidth: 100,
      rows: [],
      columns: [],
		  behavior: {
      	clickable: true,
      	draggable: true,
      	resizable: true,
        createable: true
      }
    };

    var opts = jQuery.extend(true, defaults, options);

		function build() {
		    var div = jQuery("<div>", { "class": "ganttview" });
        var chart = new Chart(div, opts);
        if (opts.data) {
          chart.render()
        }
				container.append(div);
				var w = jQuery("div.ganttview-vtheader", container).outerWidth() +
					jQuery("div.ganttview-slide-container", container).outerWidth();
	      container.css("width", (w + 2) + "px");
        new Behavior(container, opts).apply();
        return chart;
		}
    return build();
  }

	var Chart = function(div, opts) {
		function render() {

		}



    function addBlock(ganttData, cellWidth, cellHeight) {
      var row = ganttData.row;
      var column = ganttData.column;
      var size = ganttData.size;
      var data = ganttData.data;
      var block = jQuery("<div>", {
        "class": "ganttview-block",
        "title": row + ":" + column + ":" + size,
        "css": {
          "width": ((size * cellWidth) - 9) + "px",
          "height": ((cellHeight) - 9) + "px",
          "left": ((column * cellWidth) + 3) + "px",
          "top": ((row * cellHeight) + 4 ) + "px"
        }
      }).data('block-data',ganttData);
      return block;
    }

    function addBlocks(div, ganttData, cellWidth, cellHeight) {
      var blocks = jQuery("<div>", { "class": "ganttview-blocks"});
      div.append(blocks)
      for (var i in ganttData) {
        blocks.append(addBlock(ganttData[i], cellWidth, cellHeight))
      }
    }

		return {
			render: render
		};

	}

	var Behavior = function (div, opts) {

  function apply() {
    if (opts.behavior.createable) {
      bindGridClick(div, opts.behavior.onCreate);
    }
    if (opts.behavior.clickable) {
      bindBlockClick(div, opts.behavior.onClick);
    }
    if (opts.behavior.resizable) {
      bindBlockResize(div, opts.cellWidth, opts.behavior.onResize);
    }
    if (opts.behavior.draggable) {
      bindBlockDrag(div, opts.cellWidth, opts.cellHeight, opts.behavior.onDrag);
    }
  }

  function bindGridClick(div, callback) {
    jQuery("div.ganttview-grid-row-cell", div).live("click", function () {
      var row = $(this).parent().index();;
      var column = $(this).index();
      data = {row: row, column: column, size:1};
      if (callback) { callback(data); }
    });
  }

  function bindBlockClick(div, callback) {
    jQuery("div.ganttview-block", div).live("click", function () {
      if (callback) { callback(jQuery(this).data("block-data")); }
    });
  }

  function bindBlockResize(div, cellWidth, callback) {
  	jQuery("div.ganttview-block", div).resizable({
  		grid: cellWidth,
  		handles: "e,w",
  		stop: function () {
      	var block = jQuery(this);
        var data = block.data("block-data");
        data.size = Math.ceil(block.width() / cellWidth);
        block.data("block-data",data);
  			if (callback) { callback(block.data("block-data")); }
  		}
  	});
  }

  function bindBlockDrag(div, cellWidth, cellHeight, callback) {
  	jQuery("div.ganttview-block", div).draggable({
  		grid: [cellWidth, cellHeight],
  		stop: function () {
  			var block = jQuery(this);
        var position = block.position();
        var data = block.data("block-data");
        data.row = Math.floor(position.top/cellHeight);
        data.column = Math.floor(position.left/cellWidth);
        block.data("block-data",data);
  			if (callback) { callback(block.data("block-data")); }
  		}
  	});
  }

  return {
    apply: apply
  };
}


})(jQuery);*/
