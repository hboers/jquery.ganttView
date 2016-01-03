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
  slideWidth: number

  color: string
  backgroundColor: string

  behavior: {

    clickable: boolean,
  	draggable: boolean,
  	resizable: boolean,

  	onClick: function,
  	onDrag: function,
  	onResize: function,
    onGridClick: function
    onHzHeaderClick: function
    onVtHeaderClick: function

  }

  data
  ----

  { row: 0,
    column: 0,
    size: 1,
    data {
      backgroundColor: #EEEEEE,
      color: #444444,
      title: "Titel",
      html: "Html"
    }
  }


*/

(function ( jQuery ) {

    $.fn.ganttView = function(options) {

      var container = jQuery(this);
      var settings = container.data('settings');


      if (typeof options === "string") {

        var args = Array.prototype.slice.call(arguments);

        switch(args[0]) {
          case 'addBlock':
            var blocks = jQuery("div.ganttview-blocks");
            var block = addBlock(args[1]);
            blocks.append(block);
            addBehaviour();
          break;
        }

      } else {

        settings = $.extend({
          cellWidth: 81,
          cellHeight: 31,
          slideWidth: 600,
          color: "inherit",
          rows: [],
          columns: [],
          behavior: {
            clickable: true,
            draggable: true,
            resizable: true
          }
        }, options );

        container.data('settings',settings);

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


            var h = jQuery("div.ganttview-hzheader").outerHeight();
            $("div.ganttview-vtheader").css({"margin-top":h})


            if (settings.data) {
              addBlocks(settings.data);
            }

            jQuery("div.ganttview-vtheader-item",container).click(function () {
              var data = {row: $(this).index()};
              if (settings.behavior.onVtHeaderClick) { settings.behavior.onVtHeaderClick(data); }
            });

            jQuery("div.ganttview-hzheader-column").click(function () {
              var data = {column: $(this).index()};
              if (settings.behavior.onHzHeaderClick) { settings.behavior.onHzHeaderClick(data); }
            });

            jQuery("div.ganttview-grid-row-cell").click(function () {
              var row = $(this).parent().index();;
              var column = $(this).index();
              var data = {row: row, column: column, size:1};
              if (settings.behavior.onGridClick) { settings.behavior.onGridClick(data); }
            });

            addBehaviour();

          }

          if (settings.behavior.onClick) {
            jQuery(document.body).on('click','div.ganttview-block',function () {
              data = jQuery(this).data("block-data");
              settings.behavior.onClick(data);
            });
          }

        function addVtHeader(ganttviewDiv) {
          var headerDiv = jQuery("<div>", {
            "class": "ganttview-vtheader",
          });
          for (var i = 0; i < settings.rows.length; i++) {
            var itemDiv = jQuery("<div>", { "class": "ganttview-vtheader-item" });
            itemDiv.append(jQuery("<div>", {
                "class": "ganttview-vtheader-item-name",
                "css": {
                  "height":  (settings.cellHeight-1) + "px",
                }
            }).html(settings.rows[i].html?settings.rows[i].html:''));
            if (settings.rows[i].title) {
              itemDiv.attr("title",settings.rows[i].title);
            }
            headerDiv.append(itemDiv);
          }
          ganttviewDiv.append(headerDiv);
        }


        function addHzHeader(ganttviewDiv) {
          var totalW = settings.columns.length * settings.cellWidth;
          var headerDiv = jQuery("<div>", {
            "class": "ganttview-hzheader",
            "css": {"width": totalW + "px"}
        });
          var columnsDiv = jQuery("<div>", {
            "class": "ganttview-hzheader-columns"
          });
          for (var i = 0; i < settings.columns.length; i++) {
            var columnDiv = jQuery("<div>", {
              "class": "ganttview-hzheader-column",
              "css": { "width": (settings.cellWidth - 1) +"px"}
            });
            if (settings.columns[i].html) {
              columnDiv.html(settings.columns[i].html);
            }
            if (settings.columns[i].title) {
              columnDiv.attr("title",settings.columns[i].title);
            }
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


        function addBlocks(ganttData) {
          var containerDiv = jQuery("div.ganttview-slide-container");
          var blocksDiv = jQuery("<div>", { "class": "ganttview-blocks"});
          containerDiv.append(blocksDiv);
          for (var i in ganttData) {
            blocksDiv.append(addBlock(ganttData[i]))
          }
        }

        renderChart();

      }


      function addBehaviour() {

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
            containment: ".ganttview-grid",
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

      function addBlock(ganttData) {
        var row = ganttData.row;
        var color = settings.color;
        var backgroundColor = settings.backgroundColor;
        var title = '';
        if (ganttData.data) {
          if (ganttData.data.color) {color = ganttData.data.color;}
          if (ganttData.data.backgroundColor) {backgroundColor = ganttData.data.backgroundColor;}
          if (ganttData.data.title) {title = ganttData.data.title;}
        }
        var column = ganttData.column;
        var size = ganttData.size;
        var data = ganttData.data;
        var block = jQuery("<div>", {
          "class": "ganttview-block",
          "title": title,
          "css": {
            "width": ((size * settings.cellWidth) - 9) + "px",
            "height": ((settings.cellHeight) - 9) + "px",
            "left": ((column * settings.cellWidth) + 3) + "px",
            "top": ((row * settings.cellHeight) + 4 ) + "px",
            "color": color,
            "background-color": backgroundColor
          }
        });
        block.data('block-data',ganttData);
        if (ganttData.data && ganttData.data.html) {
          var text = jQuery("<div>", {"class": "ganttview-block-text"});
          text.html(ganttData.data.html);
          block.append(text);
        }



        return block;
      }



      return this;


    };

}( jQuery ));
