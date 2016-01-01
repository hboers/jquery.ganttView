/*
jQuery.ganttView
Copyright (c) 2010 JC Grubbs - jc.grubbs@devmynd.com
Copyright (c) 2015 H. Boers - hboers.me.com
MIT License Applies
*/

/*
  Options
  -----------------

  rows: array
  columns: array

  data: array

  cellWidth: number
  cellHeight: number
  headerHeight: number
  slideWidth: number

  behavior: {

    clickable: boolean,
  	draggable: boolean,
  	resizable: boolean,

  	onClick: function,
  	onDrag: function,
  	onResize: function,
    onGridClick: function

  }

  data
  ----

  { row: 0,
    column: 0,
    size: 1, 
    data {
      color: #444444,
      title: "Titel",
      text: "Text"
    }
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
            columns: [],
            behavior: {
              clickable: true,
              draggable: true,
              resizable: true
            }
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

          if (settings.data) {
            addBlocks(settings.data);
          }


          jQuery("div.ganttview-grid-row-cell",container).click(function () {
            var row = $(this).parent().index();;
            var column = $(this).index();
            var data = {row: row, column: column, size:1};
            if (settings.behavior.onGridClick) { settings.behavior.onGridClick(data); }
          });


          if (settings.behavior.onResize) {
            jQuery("div.ganttview-block").resizable({
              grid: settings.cellWidth,
              handles: "e",
              stop: function () {
                var block = jQuery(this);
                var data = block.data("block-data");
                data.from_size = data.size;
                data.size = Math.ceil(block.width() / settings.cellWidth);
                block.data("block-data",data);
                settings.behavior.onResize(data);
              }
            });
          }


          if (settings.behavior.onDrag){
            jQuery("div.ganttview-block").draggable({
              grid: [settings.cellWidth, settings.cellHeight],
              stop: function (event,ui) {
                var block = jQuery(this);
                var position = block.position();
                var data = block.data("block-data");
                data.from_row = data.row;
                data.row = Math.floor(position.top/settings.cellHeight);
                data.from_column =  data.column;
                data.column = Math.floor(position.left/settings.cellWidth);
                block.data("block-data",data);
                settings.behavior.onDrag(block.data("block-data"));
              }
            });
          }
        }

        if (settings.behavior.onClick) {
          jQuery("div.ganttview-block").click(function () {
            data = jQuery(this).data("block-data");
            settings.behavior.onClick(data);
          });
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


        function addBlock(ganttData) {
          var row = ganttData.row;
          var column = ganttData.column;
          var size = ganttData.size;
          var data = ganttData.data;
          var block = jQuery("<div>", {
            "class": "ganttview-block",
            "title": row + ":" + column + ":" + size,
            "css": {
              "width": ((size * settings.cellWidth) - 9) + "px",
              "height": ((settings.cellHeight) - 9) + "px",
              "left": ((column * settings.cellWidth) + 3) + "px",
              "top": ((row * settings.cellHeight) + 4 ) + "px"
            }
          });
          block.data('block-data',ganttData);
          return block;
        }


        function addBlocks(ganttData) {
          var containerDiv = jQuery("div.ganttview-slide-container");
          var blocksDiv = jQuery("<div>", { "class": "ganttview-blocks"});
          containerDiv.append(blocksDiv);
          for (var i in ganttData) {
            blocksDiv.append(addBlock(ganttData[i]))
          }
        }

        renderChart();

        return this;

    };

}( jQuery ));
