// uncomment the cdn.rawgit.com versions and comment the cis.umassd.edu versions if you require all https data
var color;
var RegionalData;
var local;
var map = new L.Map("map", { center: [42.04346, -71.68412], zoom: 8 }).addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));
d3.queue()
    .defer(d3.json, "https://cdn.rawgit.com/dakoop/e3d0b2100c6b6774554dddb0947f2b67/raw/b88ded9fbc37a4e13e7f94d58a79efe2074c8c8a/ma-school-districts-100.geojson")
    // use this version if the 100m version is too slow
    //.defer(d3.json, "https://cdn.rawgit.com/dakoop/e3d0b2100c6b6774554dddb0947f2b67/raw/b88ded9fbc37a4e13e7f94d58a79efe2074c8c8a/ma-school-districts-500.geojson")
    .defer(d3.csv, "https://gist.githubusercontent.com/dakoop/e3d0b2100c6b6774554dddb0947f2b67/raw/b88ded9fbc37a4e13e7f94d58a79efe2074c8c8a/ma-school-funding.csv")
    .await(createVis);

function createVis(errors, mapData, spendingData) {
        
    var features = mapData.features;

    //This nested loop iterates through the data matches the district and
    //appends the ttpp field of the matched districts of CSV file to the geoJSON file

    for (var i = 0; i < spendingData.length; i++)
    {
        var spend_district = spendingData[i].District; // districts of spending data

            var ttpp = spendingData[i].TTPP;
            for (var j = 0; j < features.length; j++)
            {
                
                var map_district = features[j].properties.DISTRICT;    // districts of mapdata
                var data = features[j].properties.MADISTTYPE;           
                
                if (map_district == spend_district)
                {
                    features[j].properties.TTPP = ttpp;                   
                    if (data == "Local School") {                        
                        var ttppfield = features[j].properties.TTPP;
              
                }
            }


            }            
            var mp = [];
            mp = mapData;            
            local = mp.features.filter(function (t)             //Filtering the data having DISTRICT = local school
            {
                return t.properties.MADISTTYPE == "Local School";
            });

            var regional = [];
            regional = mapData;
            RegionalData = regional.features.filter(function (m)    //Filtering the data having DISTRICT = Regional Academic
             {
                return m.properties.MADISTTYPE == "Regional Academic";
            });          
    }
   
    var length = (mapData.features.length)-1;      
    var width = 700;
    var height = 580;
    var svg = d3.select("#map1").append("svg").attr("width", width).attr("height", height);     //creating an svg
    var g = svg.append("g");    
    var projection1 = d3.geoConicConformal().scale(10000).parallels([41 + 17 / 60, 41 + 29 / 60]).rotate([70 + 30 / 60, 0]).translate([500, 320]).center([0, 41.313]);    //setting the propertiesof map
    var geoPath1 = d3.geoPath().projection(projection1);
    

    //Appending data , path and stroke attibutes and setting opacity 

    g.selectAll("path")
    .data(mapData.features)
    .enter()
    .append("path")    
    .attr("fill", "#ff221039")    
    .attr("stroke", "#000000")
    .attr("opacity","0.8")
    .attr("d", geoPath1)    
    var localStr = "local";
    var regionalStr = "regional";
    var overlay = "overlay";


    // Function call for total per-pupil spending for local public schools
    processData(local, localStr);
 //   $("#overlay").remove();     // Clearing the data which overlays on third part to avoid overlapping
    // Function call for total per-pupil spending for regional public schools 
    processData(RegionalData, regionalStr);
   // $("#overlay").remove(); // Clearing the data which overlays on third part to avoid overlapping
   


    // drop down for the extra credit to choose between local data and regional data
    $('select[name="dropdown"]').change(function ()
    {
        if ($(this).val() == "local")       // if local is selected
        {
            debugger;
            
            $("#overlay").remove();     // Removing the previous svg to avoid overlap
            var svg1 = d3.select(map.getPanes().overlayPane).append("svg"),
            g = svg1.append("g").attr("class", "leaflet-zoom-hide").attr("id", "overlay");                                    
            overlaymap(local, localStr);
            $("#overlay").remove();  // Removing the previous svg to avoid overlap
            //$("#loc").remove();
            //$("#reg").remove();
        }
            
        if ($(this).val() == "regional")        // if regional is selected
        {
            debugger;
            
            $("#overlay").remove();     // Removing the previous svg to avoid overlap                   
            var svg2 = d3.select(map.getPanes().overlayPane).append("svg"),
            g = svg2.append("g").attr("class", "leaflet-zoom-hide").attr("id", "overlay");
            overlaymap(RegionalData, regionalStr);
            $("#overlay").remove();
            //$("#loc").remove();
          //  $("#reg").remove();
        }

    })
    
    }

// Function which works for local, regional and overlays
function processData(file1data, Str) {        
    var datavalue;
    
    
    if(Str=="local")        // If the received string is local then show the local data
    {
        datavalue = local;
    }
    else if (Str == "regional")     // If the received string is regional then show the regional data
    {
        datavalue = RegionalData;
    }    
    var width = 1000;
    var height = 580;   
    if (Str == "local")             // If local data is to be shown then append id as loc
    {
        var svg = d3.select("#map-local").append("svg").attr("width", width).attr("height", height).text("x:20 y:20", "Local").attr("id","loc");
    }
    if (Str == "regional")      // If local data is to be shown then append id as reg
    {
        var svg = d3.select("#map-regional").append("svg").attr("width", width).attr("height", height).text("x:20 y:20", "Local").attr("id","reg");
    }
    
    var g = svg.append("g");    
    var projection = d3.geoConicConformal().scale(10000).parallels([41 + 17 / 60, 41 + 29 / 60]).rotate([70 + 30 / 60, 0]).translate([600, 320]).center([0, 41.313]);
    var geoPath = d3.geoPath().projection(projection);

    // Finding out the maximum and minimum value

    var maxval = d3.extent(file1data.map(function (f)
    {
        var values = f.properties.TTPP;
        if (values != "")        
            return (f.properties.TTPP)      //selecting all the ttpp and giving it to the extent function which
                                            //gives is the maximum and minimum value as an array
    }));
    
    color = d3.scaleSequential(d3.interpolateOranges).domain(maxval);       //setting ornage color shade 
    
    g.selectAll("path")
    .data(file1data)
    .enter()
    .append("path")    
    .attr("fill", function (z) {
        if (z.properties.TTPP)
            return color(z.properties.TTPP);
        else
            return color(maxval[0]-1000);
    })        
    .attr("stroke", "#000000") 
    .attr("d", geoPath)


    //Calculating 11 values for setting them on the legends
    var values = [];
    var minvalue = parseInt(maxval[0]);
    var maxvalue = parseInt(maxval[1]);    
    var add = 0;
    var differencce = (maxvalue - minvalue) / 10;    
    for(var b=0;b<=10;b++)
    {
        values[b] = minvalue + add;        
        add = differencce;
        minvalue = values[b];
        values[b] = values[b].toFixed(0);
    }
    
    //Setting legend
    var legend = g.append("g")
        .attr("font-weight", "bold")         //Setting attributes like font weight size and anchoring      
        .attr("text-anchor", "end")
        .attr("font-size", 12)
      .selectAll("g")
        .data(values)
      //.data(key.slice())
      .enter().append("g")
        .attr("transform", function (d, k) {            // Applying transform
            return "translate(5," + k * 30 + ")";
        });


    //Setting the rectangles of the legend
    legend.append("rect")
       .data(values)
        .attr("x", width - 20)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", function (d) {
            return color(d)                              // Adding weights to colour

        });


     //Appending text to legends
    legend.append("text")
        .attr("x", width - 28)                      // Setting x attribute
        .attr("y", 14)                              // Setting y attribute
        .text(function (d) {
            return d;
        });

    //    var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    //    g = svg.append("g").attr("class", "leaflet-zoom-hide").attr("id", "overlay");
    //    d3.json("https://cdn.rawgit.com/dakoop/e3d0b2100c6b6774554dddb0947f2b67/raw/b88ded9fbc37a4e13e7f94d58a79efe2074c8c8a/ma-school-districts-100.geojson", function (geoShape) {

    //        //  create a d3.geo.path to convert GeoJSON to SVG
    //    var transform = d3.geoTransform({ point: projectPoint });
    //    path = d3.geoPath().projection(transform);


    //    var projection = d3.geoConicConformal().scale(10000).parallels([41 + 17 / 60, 41 + 29 / 60]).rotate([70 + 30 / 60, 0]).translate([600, 320]).center([0, 41.313]);
    //    var geoPath = d3.geoPath().projection(projection);


    //        var maxval = d3.extent(datavalue.map(function (f) {
    //            var values = f.properties.TTPP;
    //            if (values != "")
    //                return (f.properties.TTPP)
    //        }));
    //        color = d3.scaleSequential(d3.interpolateOrRd).domain(maxval);

    //        // create path elements for each of the features
    //        d3_features = g.selectAll("path")
    //            .data(datavalue)
    //            .enter().append("path")
    //        .attr("fill", function (z) {
    //            if (z.properties.TTPP)
    //                return color(z.properties.TTPP);
    //            else
    //                return color(10000);
    //        })
    //    .attr("stroke", "#000000")
    //        .attr("opacity", "0.7")
    //    .attr("d", geoPath);
    //        map.on("viewreset", reset);
    //        reset();

    //        // Reset function
    //        function reset() {

    //            bounds = path.bounds(geoShape);

    //            var topLeft = bounds[0],
    //                bottomRight = bounds[1];

    //            svg.attr("width", bottomRight[0] - topLeft[0])
    //                .attr("height", bottomRight[1] - topLeft[1])
    //                .style("left", topLeft[0] + "px")
    //                .style("top", topLeft[1] + "px");

    //            g.attr("transform", "translate(" + -topLeft[0] + ","
    //                                              + -topLeft[1] + ")");

    //            d3_features.attr("d", path)
    //                .style("fill-opacity", 0.7)
    //                .attr('fill', function (z) {
    //                    if (z.properties.TTPP)
    //                        return color(z.properties.TTPP);
    //                    else
    //                        return color(10000);
    //                });

    //        }
         
    //        //function projectPoint(lng, lat) {
    //        //    var point = map.latLngToLayerPoint(new L.LatLng(lat, lng));
    //        //    this.stream.point(point.x, point.y);
    //        //}
    //        function projectPoint(lng, lat) {
    //            let point = map.latLngToLayerPoint(new L.LatLng(lat, lng));
    //            this.stream.point(point.x, point.y);
    //        }

    //    })
}


function overlaymap(file1data, Str) {
    var datavalue;


    if (Str == "local")        // If the received string is local then show the local data
    {
        datavalue = local;
    }
    else if (Str == "regional")     // If the received string is regional then show the regional data
    {
        datavalue = RegionalData;
    }

    var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide").attr("id", "overlay");
    d3.json("https://cdn.rawgit.com/dakoop/e3d0b2100c6b6774554dddb0947f2b67/raw/b88ded9fbc37a4e13e7f94d58a79efe2074c8c8a/ma-school-districts-100.geojson", function (geoShape) {

        //  create a d3.geo.path to convert GeoJSON to SVG
        var transform = d3.geoTransform({ point: projectPoint });
        path = d3.geoPath().projection(transform);


        var projection = d3.geoConicConformal().scale(10000).parallels([41 + 17 / 60, 41 + 29 / 60]).rotate([70 + 30 / 60, 0]).translate([600, 320]).center([0, 41.313]);
        var geoPath = d3.geoPath().projection(projection);


        var maxval = d3.extent(datavalue.map(function (f) {
            var values = f.properties.TTPP;
            if (values != "")
                return (f.properties.TTPP)
        }));
        color = d3.scaleSequential(d3.interpolateOrRd).domain(maxval);

        // create path elements for each of the features
        d3_features = g.selectAll("path")
            .data(datavalue)
            .enter().append("path")
        .attr("fill", function (z) {
            if (z.properties.TTPP)
                return color(z.properties.TTPP);
            else
                return color(10000);
        })
    .attr("stroke", "#000000")
        .attr("opacity", "0.7")
    .attr("d", geoPath);
        map.on("viewreset", reset);
        reset();

        // Reset function
        function reset() {

            bounds = path.bounds(geoShape);

            var topLeft = bounds[0],
                bottomRight = bounds[1];

            svg.attr("width", bottomRight[0] - topLeft[0])
                .attr("height", bottomRight[1] - topLeft[1])
                .style("left", topLeft[0] + "px")
                .style("top", topLeft[1] + "px");

            g.attr("transform", "translate(" + -topLeft[0] + ","
                                              + -topLeft[1] + ")");

            d3_features.attr("d", path)
                .style("fill-opacity", 0.7)
                .attr('fill', function (z) {
                    if (z.properties.TTPP)
                        return color(z.properties.TTPP);
                    else
                        return color(10000);
                });

        }

        //function projectPoint(lng, lat) {
        //    var point = map.latLngToLayerPoint(new L.LatLng(lat, lng));
        //    this.stream.point(point.x, point.y);
        //}
        function projectPoint(lng, lat) {
            let point = map.latLngToLayerPoint(new L.LatLng(lat, lng));
            this.stream.point(point.x, point.y);
        }

    })
}




