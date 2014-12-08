"use strict";var Canvas=function e(t){function o(e,t,o){for(;1.1*e.width()<t.width()-2*o;)e.fontSize(1.1*e.fontSize()),e.y((t.height()-e.height())/2);e.setX(t.getX()-e.getWidth()/2),e.setY(t.getY()-e.getHeight()/1.8)}var n,i,d,r,a,s={},c,l=[],g=!1,f=!1,u,w={blue:"#0174DF",placidblue:"#83b5dd",violettulip:"#9B90C8",hemlock:"#9eccb3",paloma:"#aab1b0",freesia:"#ffd600",cayenne:"#c40000",celosiaorange:"#f47d44",sand:"#ceb48d",dazzlingblue:"#006bb6",edge:"#e85657",selected:"gold"},h={defaultNodeSize:35,defaultNodeColor:w.blue,defaultEdgeColor:w.edge,concentricCircleColor:"#ffffff",concentricCircleNumber:4,criteria:{from:network.getNodes({type_t0:"Ego"})[0].id},nodeTypes:[{name:"Person",color:w.blue},{name:"OnlinePerson",color:w.hemlock},{name:"Organisation",color:w.cayenne},{name:"Professional",color:w.violettulip}]},v=function(e){s.addNode(e.detail)},m=function(e){"undefined"!=typeof e.detail.from&&e.detail.from!==network.getNodes({type_t0:"Ego"})[0].id&&s.addEdge(e.detail)},p=function(e){s.removeNode(e.detail)},y=function(e){s.removeEdge(e.detail)},k=function(){var e=$(".info-button").offset(),t=$(".canvas-title").offset();$(".canvas-title").data("oldPos",t),$(".canvas-title").css({position:"absolute"}),$(".canvas-title").offset(t),$(".canvas-title").children().hide(),$(".canvas-title").addClass("closed"),$(".canvas-title").offset(e),setTimeout(function(){$(".canvas-popover").hide(),$(".info-button").css("visibility","visible")},500)},E=function(){$(".info-button").css("visibility","hidden"),$(".canvas-popover").show(),$(".canvas-title").offset($(".canvas-title").data("oldPos")),$(".canvas-title").removeClass("closed"),setTimeout(function(){$(".canvas-title").children().show()},500)},b=function(e){if(!f&&(g||($(".new-node-form").addClass("node-form-open"),$(".content").addClass("blurry"),g=!0,$(".name-box").focus()),8!==e.which||$(e.target).is("input, textarea, div")||e.preventDefault(),13===event.which)){$(".new-node-form").removeClass("node-form-open"),$(".content").removeClass("blurry"),g=!1;var t={label:$(".name-box").val()};network.addNode(t),$(".name-box").val("")}},N=function(){s.destroy()};return s.init=function(){notify("Canvas initialising.",1),extend(h,t),$('<div class="canvas-title"><h3>'+h.heading+'</h3><p class="lead">'+h.subheading+"</p></div>").insertBefore("#kineticCanvas"),s.initKinetic(),u=menu.addMenu("Canvas","hi-icon-support"),menu.addItem(u,"Load Network","icon-play",null),menu.addItem(u,"Create Random Graph","icon-play",null),menu.addItem(u,"Download Network Data","icon-play",null),menu.addItem(u,"Reset Node Positions","icon-play",s.resetPositions),menu.addItem(u,"Clear Graph","icon-play",null),window.addEventListener("nodeAdded",v,!1),window.addEventListener("edgeAdded",m,!1),window.addEventListener("nodeRemoved",p,!1),window.addEventListener("edgeRemoved",y,!1),window.addEventListener("changeStageStart",N,!1),$(".close-popover").on("click",k),$(".info-button").on("click",E);for(var e=network.getEdges(h.criteria),o=0;o<e.length;o++){var n=network.getEdges({from:e[o].from,to:e[o].to,type:"Dyad"})[0],i=s.addNode(n);"Select"===h.mode&&network.getEdges({from:network.getNodes({type_t0:"Ego"})[0].id,to:e[o].to,type:h.edgeType}).length>0&&(i.children[0].stroke(w.selected),r.draw())}setTimeout(function(){s.drawUIComponents()},0);var d,a;"Edge"===h.mode?(a={type:h.edgeType},d=network.getEdges(a,function(e){var t=[];return $.each(e,function(e,o){o.from!==network.getNodes({type_t0:"Ego"})[0].id&&o.to!==network.getNodes({type_t0:"Ego"})[0].id&&t.push(o)}),t}),$.each(d,function(e,t){s.addEdge(t)})):(a={},a=h.showEdge?{type:h.showEdge}:{type:"Dyad"},d=network.getEdges(a,function(e){var t=[];return $.each(e,function(e,o){o.from!==network.getNodes({type_t0:"Ego"})[0].id&&o.to!==network.getNodes({type_t0:"Ego"})[0].id&&t.push(o)}),t}),$.each(d,function(e,t){s.addEdge(t)}))},s.destroy=function(){menu.removeMenu(u),$(".new-node-form").remove(),window.removeEventListener("nodeAdded",v,!1),window.removeEventListener("edgeAdded",m,!1),window.removeEventListener("nodeRemoved",p,!1),window.removeEventListener("edgeRemoved",y,!1),window.removeEventListener("changeStageStart",N,!1),$(document).off("keypress",b),$(".close-popover").off("click",k),$(".info-button").off("click",E)},s.resetPositions=function(){for(var e=network.getEdges({from:network.getNodes({type_t0:"Ego"})[0].id,type:"Dyad"}),t=0;t<e.length;t++)network.updateEdge(e[t].id,{coords:[]})},s.addNode=function(e){notify("Canvas is creating a node.",2);for(var t,n=0;network.getNode(n)!==!1;)n++;var i=!1;("Position"===h.mode||"Edge"===h.mode)&&(i=!0),e.label=e.nname_t0;var a={coords:[$(window).width()+50,100],id:n,label:"Undefined",size:h.defaultNodeSize,color:"rgb(0,0,0)",strokeWidth:4,draggable:i,dragDistance:20};extend(a,e),a.id=parseInt(a.id,10),a.type="Person",a.x=a.coords[0],a.y=a.coords[1];var g=new Kinetic.Group(a);switch(a.type){case"Person":t=new Kinetic.Circle({radius:a.size,fill:a.color,stroke:"white",strokeWidth:a.strokeWidth});break;case"Organisation":t=new Kinetic.Rect({width:2*a.size,height:2*a.size,fill:a.color,stroke:s.calculateStrokeColor(a.color),strokeWidth:a.strokeWidth});break;case"OnlinePerson":t=new Kinetic.RegularPolygon({sides:3,fill:a.color,radius:1.2*a.size,stroke:s.calculateStrokeColor(a.color),strokeWidth:a.strokeWidth});break;case"Professional":t=new Kinetic.Star({numPoints:6,fill:a.color,innerRadius:a.size-a.size/3,outerRadius:a.size+a.size/3,stroke:s.calculateStrokeColor(a.color),strokeWidth:a.strokeWidth})}var f=new Kinetic.Text({text:a.label,fontFamily:"Lato",fill:"white",align:"center",fontStyle:500});if(notify("Putting node "+a.label+" at coordinates x:"+a.coords[0]+", y:"+a.coords[1],2),g.on("dragstart",function(){notify("dragstart",1),this.attrs.oldx=this.attrs.x,this.attrs.oldy=this.attrs.y,this.moveToTop(),r.draw()}),g.on("dragmove",function(){notify("Dragmove",0);var e=a.id;$.each(d.children,function(t,o){if(o.attrs.from.id===e||o.attrs.to.id===e){var n=[s.getNodeByID(o.attrs.from.id).getX(),s.getNodeByID(o.attrs.from.id).getY(),s.getNodeByID(o.attrs.to.id).getX(),s.getNodeByID(o.attrs.to.id).getY()];o.attrs.points=n}}),d.draw()}),g.on("tap click",function(){var e=new CustomEvent("log",{detail:{eventType:"nodeClick",eventObject:this.attrs.id}});if(window.dispatchEvent(e),"Select"===h.mode){var t;network.getEdges({type:h.edgeType,from:network.getNodes({type_t0:"Ego"})[0].id,to:this.attrs.to}).length>0?(this.children[0].stroke("white"),network.removeEdge(network.getEdges({type:h.edgeType,from:network.getNodes({type_t0:"Ego"})[0].id,to:this.attrs.to})[0])):(t={from:network.getNodes({type_t0:"Ego"})[0].id,to:this.attrs.to,type:h.edgeType},"undefined"!=typeof h.variables&&$.each(h.variables,function(e,o){t[o.label]=o.value}),this.children[0].stroke(w.selected),network.addEdge(t))}else if("Edge"===h.mode){if(l[0]===this)return!1;if(l.push(this),2===l.length){l[1].children[0].stroke("white"),l[0].children[0].stroke("white");var o={from:l[0].attrs.to,to:l[1].attrs.to,type:h.edgeType};o[h.variables[0]]="perceived",network.addEdge(o)===!1&&(notify("Canvas removing edge.",2),network.removeEdge(network.getEdges(o))),l=[],r.draw()}else this.children[0].stroke(w.selected),r.draw()}this.moveToTop(),r.draw()}),g.on("dbltap dblclick",function(){"Edge"===h.mode&&(notify("double tap",1),c=this)}),g.on("dragend",function(){notify("dragend",1);var e={},t={};e.x=this.attrs.oldx,e.y=this.attrs.oldy,t.x=this.attrs.x,t.y=this.attrs.y;var o={from:e,to:t},n=this,i=new CustomEvent("log",{detail:{eventType:"nodeMove",eventObject:o}});window.dispatchEvent(i),network.setProperties(network.getEdge(n.attrs.id),{coords:[n.attrs.x,n.attrs.y]}),delete this.attrs.oldx,delete this.attrs.oldy}),o(f,t,10),g.add(t),g.add(f),r.add(g),setTimeout(function(){r.draw()},0),!e.coords||0===e.coords.length){var u=new Kinetic.Tween({node:g,x:$(window).width()-150,y:100,duration:.7,easing:Kinetic.Easings.EaseOut});u.play(),network.setProperties(network.getNode(a.id),{coords:[$(window).width()-150,100]})}return g},s.addEdge=function(e){notify("Canvas is adding an edge.",2);var t=network.getEdges({from:network.getNodes({type_t0:"Ego"})[0].id,to:e.to,type:"Dyad"})[0],o=network.getEdges({from:network.getNodes({type_t0:"Ego"})[0].id,to:e.from,type:"Dyad"})[0],n=[o.coords[0],o.coords[1],t.coords[0],t.coords[1]],i=new Kinetic.Line({strokeWidth:2,opacity:1,stroke:h.defaultEdgeColor,from:o,to:t,points:n});return d.add(i),setTimeout(function(){d.draw()},0),r.draw(),notify("Created Edge between "+o.label+" and "+t.label,"success",2),!0},s.removeEdge=function(e){var t=network.getEdges({from:network.getNodes({type_t0:"Ego"})[0].id,to:e.to,type:"Dyad"})[0],o=network.getEdges({from:network.getNodes({type_t0:"Ego"})[0].id,to:e.from,type:"Dyad"})[0];notify("Removing edge."),$.each(s.getKineticEdges(),function(e,n){(n.attrs.from===o&&n.attrs.to===t||n.attrs.from===t&&n.attrs.to===o)&&(d.children[e].remove(),d.draw())})},s.clearGraph=function(){d.removeChildren(),d.clear(),r.removeChildren(),r.clear()},s.initKinetic=function(){n=new Kinetic.Stage({container:"kineticCanvas",width:window.innerWidth,height:window.innerHeight}),i=new Kinetic.Layer,r=new Kinetic.Layer,d=new Kinetic.Layer,a=new Kinetic.Layer,n.add(i),n.add(d),n.add(r),n.add(a),notify("Kinetic stage initialised.",1)},s.drawUIComponents=function(){for(var e,t,o=h.concentricCircleColor,n=window.innerHeight-h.defaultNodeSize,d=.1,r=0;r<h.concentricCircleNumber;r++){var s=1-r/h.concentricCircleNumber,c=n/2*s;t=new Kinetic.Circle({x:window.innerWidth/2,y:window.innerHeight/2,radius:c,stroke:"white",strokeWidth:1.5,opacity:0}),e=new Kinetic.Circle({x:window.innerWidth/2,y:window.innerHeight/2,radius:c,fill:o,opacity:d,strokeWidth:0}),d+=(.3-d)/h.concentricCircleNumber,i.add(e),i.add(t)}i.draw(),a.draw(),notify("User interface initialised.",1)},s.initNewNodeForm=function(){var e=$('<div class="new-node-form"></div>'),t=$('<div class="new-node-inner"></div>');e.append(t),t.append("<h1>Add a new contact</h1>"),t.append("<p>Some text accompanying the node creation box.</p>"),t.append('<input type="text" class="form-control name-box"></input>'),$(".content").after(e),$(document).on("keypress",b)},s.getKineticNodes=function(){return r.children},s.getKineticEdges=function(){return d.children},s.getSimpleNodes=function(){var e={},t=s.getKineticNodes();return $.each(t,function(t,o){e[o.attrs.id]={},e[o.attrs.id].x=o.attrs.x,e[o.attrs.id].y=o.attrs.y,e[o.attrs.id].name=o.attrs.name,e[o.attrs.id].type=o.attrs.type,e[o.attrs.id].size=o.attrs.size,e[o.attrs.id].color=o.attrs.color}),e},s.getSimpleEdges=function(){var e={},t=0;return $.each(d.children,function(o,n){e[t]={},e[t].from=n.attrs.from.attrs.id,e[t].to=n.attrs.to.attrs.id,t++}),e},s.getSimpleEdge=function(e){var t=s.getSimpleEdges();if(!e)return!1;var o=t[e];return o},s.getEdgeLayer=function(){return d},s.getNodeByID=function(e){var t={},o=s.getKineticNodes();return $.each(o,function(o,n){n.attrs.id===e&&(t=n)}),t},s.getNodeColorByType=function(e){var t=null;return $.each(h.nodeTypes,function(o,n){n.name===e&&(t=n.color)}),t?t:!1},s.init(),s};