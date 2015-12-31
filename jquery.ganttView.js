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

(function (jQuery) {

  jQuery.fn.ganttView = function () {
    var args = Array.prototype.slice.call(arguments);
    	if (args.length == 1 && typeof(args[0]) == "object") {
        build.call(this, args[0]);
    	}
    	if (args.length == 2 && typeof(args[0]) == "string") {
    		handleMethod.call(this, args[0], args[1]);
    	}
  };

  function build(options) {
    var els = this;
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

		if (opts.data) {
			build();
		}

		function build() {
			var slots = Math.floor((opts.slideWidth / opts.cellWidth)  + 5);
	    els.each(function () {
        var container = jQuery(this);
        var div = jQuery("<div>", { "class": "ganttview" });
        new Chart(div, opts).render();
				container.append(div);
				var w = jQuery("div.ganttview-vtheader", container).outerWidth() +
					jQuery("div.ganttview-slide-container", container).outerWidth();
	      container.css("width", (w + 2) + "px");
        new Behavior(container, opts).apply();
	    });
		}
  }

	function handleMethod(method, value) {
		if (method == "setSlideWidth") {
			var div = $("div.ganttview", this);
			div.each(function () {
				var vtWidth = $("div.ganttview-vtheader", div).outerWidth();
				$(div).width(vtWidth + value + 1);
				$("div.ganttview-slide-container", this).width(value);
			});
		}
    if (method == "addBlock") {
			var div = $("div.ganttview", this);
			div.each(function () {
        // TODO addBlock
			});
		}
    if (method == "removeBlock") {
      var div = $("div.ganttview", this);
      div.each(function () {
        // TODO removeBlock
      });
    }
	}

	var Chart = function(div, opts) {
		function render() {
			addVtHeader(div, opts.rows, opts.cellHeight,opts.headerHeight);
      var slideDiv = jQuery("<div>", {
        "class": "ganttview-slide-container",
        "css": { "width": opts.slideWidth + "px" }
      });
      addHzHeader(slideDiv, opts.columns, opts.cellWidth,opts.headerHeight);
      addGrid(slideDiv, opts.rows, opts.columns, opts.cellWidth, opts.cellHeight);
      addBlocks(slideDiv, opts.data, opts.cellWidth, opts.cellHeight);
      div.append(slideDiv);
		}

    /**
     * Row Title
     */
    function addVtHeader(div, rows, cellHeight, headerHeight) {
      var headerDiv = jQuery("<div>", {
         "class": "ganttview-vtheader",
         "css": {"margin-top": (headerHeight -1) +"px"}
        });
      for (var i = 0; i < rows.length; i++) {
        var itemDiv = jQuery("<div>", { "class": "ganttview-vtheader-item" });
        itemDiv.append(jQuery("<div>", {
            "class": "ganttview-vtheader-item-name",
            "css": { "height":  (cellHeight-1) + "px" }
        }).append(rows[i].name));
        if (rows[i].title) {
          itemDiv.attr("title",rows[i].title);
        }
        headerDiv.append(itemDiv);
      }
      div.append(headerDiv);
    }

    /**
     *  Create the Header
     */
    function addHzHeader(div, columns, cellWidth, headerHeight) {
      var totalW = columns.length * cellWidth;
      var headerDiv = jQuery("<div>", {
        "class": "ganttview-hzheader",
        "css": {"width": totalW + "px",
        "height": (headerHeight - 1) + "px"}
      });
      var columnsDiv = jQuery("<div>", {
        "class": "ganttview-hzheader-columns"
      });
      for (var c in columns) {
        var columnDiv = jQuery("<div>", {
          "class": "ganttview-hzheader-column",
          "css": { "width": (cellWidth - 1) +"px"}
        }).append(columns[c].name);
        if (columns[c].title) {
          columnsDiv.attr("title",columns[c].title);
        }
        columnsDiv.append(columnDiv);
      }
      headerDiv.append(columnsDiv);
      div.append(headerDiv);
    }

    /**
     * Grid zeichnen
     */
    function addGrid(div, rows, columns, cellWidth, cellHeight) {
      var gridDiv = jQuery("<div>", { "class": "ganttview-grid" });
      var rowDiv = jQuery("<div>", { "class": "ganttview-grid-row" });
      for (var c in columns) {
        var cellDiv = jQuery("<div>", {
          "class": "ganttview-grid-row-cell",
          "css": {
            "width": (cellWidth-1) + "px",
            "height": (cellHeight-1) + "px"
          }
        });
        rowDiv.append(cellDiv);
      }
      var w = jQuery("div.ganttview-grid-row-cell", rowDiv).length * cellWidth;
      rowDiv.css("width", w + "px");
      gridDiv.css("width", w + "px");
      for (var i = 0; i < rows.length; i++) {
          gridDiv.append(rowDiv.clone());
      }
      div.append(gridDiv);
    }

    /**
     * Add Blocks
     */
    function addBlocks(div, ganttData, cellWidth, cellHeight) {
      var blocks = jQuery("<div>", { "class": "ganttview-blocks"});
      div.append(blocks)
      for (var i in ganttData) {
        var row = ganttData[i].row;
        var column = ganttData[i].column;
        var size = ganttData[i].size;
        var data = ganttData[i].data;
        var block = jQuery("<div>", {
          "class": "ganttview-block",
          "title": row + ":" + column + ":" + size,
          "css": {
            "width": ((size * cellWidth) - 9) + "px",
            "height": ((cellHeight) - 9) + "px",
            "left": ((column * cellWidth) + 3) + "px",
            "top": ((row * cellHeight) + 4 ) + "px"
          }
        }).data('block-data',ganttData[i]);
        blocks.append(block)
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
  /**
   *
   */
  function bindGridClick(div, callback) {
    jQuery("div.ganttview-grid-row-cell", div).live("click", function () {
      var row = $(this).parent().index();;
      var column = $(this).index();
      data = {row: row, column: column, size:1};
      if (callback) { callback(data); }
    });
  }
  /**
   *
   */
  function bindBlockClick(div, callback) {
    jQuery("div.ganttview-block", div).live("click", function () {
      if (callback) { callback(jQuery(this).data("block-data")); }
    });
  }
  /**
   *
   */
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
  /**
   *
   */
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


})(jQuery);
