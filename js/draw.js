// -- FUNCTION --
//绘制整个地图，每个单元格按先后顺序，绘制道路，水，资源，城市，人，战争补给动作等。后画的会部分遮挡先画的。
function drawCells(){
    contextMap.clearRect(0,0,windowSizeMap,windowSizeMap);
	var cellSide = Math.round(windowSizeMap / globalData.mapCellSize); //边长
	//var cellRadius = Math.round(windowSizeMap / globalData.mapCellSize / 2);
    for (var i=0; i<globalData.mapCellSize; i++){
        for (var j=0; j<globalData.mapCellSize; j++){
			//绘制道路（道路在相邻格是重复记录的，画的时候只要画单个格子两个方向就够了，而且边框一圈的格子不会有道路）
			if (mapMain.data.cells[i][j].roadeast > Rdcount.none){
				var rgb = Math.floor(mapMain.data.cells[i][j].roadeast*(16-255)/Rdcount.max + 255);	//根据道路计数器（近期走过的人次）计算出灰度深浅
				contextMap.fillStyle='#'+rgb.toString(16)+rgb.toString(16)+rgb.toString(16);
				contextMap.fillRect(i*cellSide+cellSide/2+1, j*cellSide+cellSide/2-1, cellSide-2, 2);	//宽度为2的道路
			}
			if (mapMain.data.cells[i][j].roadsouth > Rdcount.none){
				var rgb = Math.floor(mapMain.data.cells[i][j].roadsouth*(64-255)/Rdcount.max + 255);	//颜色从64到255
				contextMap.fillStyle='#'+rgb.toString(16)+rgb.toString(16)+rgb.toString(16);
				contextMap.fillRect(i*cellSide+cellSide/2-1, j*cellSide+cellSide/2+1, 2, cellSide-2);
			}		
			//绘制水
			if (mapMain.data.cells[i][j].terrain == Terrain.water){
				contextMap.fillStyle="darkslateblue";
				contextMap.fillRect(i*cellSide, j*cellSide, cellSide, cellSide);
			}
			//绘制资源
			if (mapMain.data.cells[i][j].resource == Resource.food){
				contextMap.fillStyle="wheat";	//食物，越多方块越大
				var resSide = Math.ceil(cellSide*mapMain.data.cells[i][j].rescount/Rescount.max);
				contextMap.fillRect(i*cellSide+Math.floor((cellSide-resSide)/2), j*cellSide+Math.floor((cellSide-resSide)/2), resSide, resSide);
			}
			//绘制城市
			if (mapMain.data.cells[i][j].citybase == Citybase.zone){
				var city = cityList[mapMain.data.cells[i][j].cityid];
				contextMap.fillStyle=getSeededRandomColor(32,255,city.data.id);
				contextMap.fillRect(i*cellSide, j*cellSide, cellSide, cellSide);
				contextMap.fillStyle="white";
				contextMap.fillRect(i*cellSide+2, j*cellSide+2, cellSide-4, cellSide-4);	//城市其它格子，空心颜色
			}
			if (mapMain.data.cells[i][j].citybase == Citybase.center){
				var city = cityList[mapMain.data.cells[i][j].cityid];
				contextMap.fillStyle=getSeededRandomColor(32,255,city.data.id);
				contextMap.fillRect(i*cellSide, j*cellSide, cellSide, cellSide);	//城市中心格子，实心颜色
			}		
			//绘制人
			if (mapMain.data.cells[i][j].peopleid != Peopleid.none){
				var vertexX = (i + 1/2) * cellSide;
				var vertexY = (j + 1/2) * cellSide;
			    //用中心颜色代表个人，周围代表部族
				var people = peopleList[mapMain.data.cells[i][j].peopleid];
				var city = cityList[people.data.cityid];
				var gradient = contextMap.createRadialGradient(vertexX, vertexY, Math.max(cellSide/8,1), vertexX, vertexY, cellSide/6);	//中心四分之一的个人颜色，到三分之一处是部族颜色
				gradient.addColorStop(0, getSeededRandomColor(32,255, people.data.id));
				gradient.addColorStop(1, getSeededRandomColor(32,255,city.data.id));
				contextMap.fillStyle = gradient;
				contextMap.beginPath();
				contextMap.arc(vertexX, vertexY, cellSide/2-1, 0, 2*Math.PI);
				contextMap.fill();
			}			
			//绘制文化
			if (mapMain.data.cells[i][j].cityculture != Cityid.none){
				var city = cityList[mapMain.data.cells[i][j].cityculture];
				contextMap.fillStyle=getSeededRandomColor(32,255,city.data.id);
				//contextMap.fillRect(i*cellSide+cellSide/2-1, j*cellSide+cellSide/2-1, 2, 2);
				if (i>=1 && mapMain.data.cells[i][j].cityculture != mapMain.data.cells[i-1][j].cityculture){
					contextMap.fillRect(i*cellSide, (j+1/4)*cellSide, 1, cellSide/2);
				}
				if (i<globalData.mapCellSize-1 && mapMain.data.cells[i][j].cityculture != mapMain.data.cells[i+1][j].cityculture){
					contextMap.fillRect((i+1)*cellSide-1, (j+1/4)*cellSide, 1, cellSide/2);
				}
				if (j>=1 && mapMain.data.cells[i][j].cityculture != mapMain.data.cells[i][j-1].cityculture){
					contextMap.fillRect((i+1/4)*cellSide, j*cellSide, cellSide/2, 1);
				}
				if (j<globalData.mapCellSize-1 && mapMain.data.cells[i][j].cityculture != mapMain.data.cells[i][j+1].cityculture){
					contextMap.fillRect((i+1/4)*cellSide, (j+1)*cellSide-1, cellSide/2, 1);
				}				
			}						
			//绘制战争和补给
			if (mapMain.data.cells[i][j].peopleid != Peopleid.none){
				var people = peopleList[mapMain.data.cells[i][j].peopleid];
				
				if (people.data.combatdirect == Direct.west){
					contextMap.fillStyle="magenta";
					contextMap.fillRect(i*cellSide, j*cellSide+cellSide/2-3, cellSide/2, 6);
				}
				else if (people.data.combatdirect == Direct.east){
					contextMap.fillStyle="magenta";
					contextMap.fillRect(i*cellSide+cellSide/2, j*cellSide+cellSide/2-3, cellSide/2, 6);
				}
				else if (people.data.combatdirect == Direct.north){
					contextMap.fillStyle="magenta";
					contextMap.fillRect(i*cellSide+cellSide/2-3, j*cellSide, 6, cellSide/2);
				}
				else if (people.data.combatdirect == Direct.south){
					contextMap.fillStyle="magenta";
					contextMap.fillRect(i*cellSide+cellSide/2-3, j*cellSide+cellSide/2, 6, cellSide/2);
				}
				
				if (people.data.feeddirect == Direct.west){
					contextMap.fillStyle="greenyellow";
					contextMap.fillRect(i*cellSide, j*cellSide+cellSide/2-3, cellSide/2, 6);
				}
				else if (people.data.feeddirect == Direct.east){
					contextMap.fillStyle="greenyellow";
					contextMap.fillRect(i*cellSide+cellSide/2, j*cellSide+cellSide/2-3, cellSide/2, 6);
				}
				else if (people.data.feeddirect == Direct.north){
					contextMap.fillStyle="greenyellow";
					contextMap.fillRect(i*cellSide+cellSide/2-3, j*cellSide, 6, cellSide/2);
				}
				else if (people.data.feeddirect == Direct.south){
					contextMap.fillStyle="greenyellow";
					contextMap.fillRect(i*cellSide+cellSide/2-3, j*cellSide+cellSide/2, 6, cellSide/2);
				}
			}
        }
    }
}

function showHighlight() {
	//绘制高亮记号（仅用于调试）
	var posX, posY;
	var cellSide = Math.round(windowSizeMap / globalData.mapCellSize); //边长
	if (peopleList.length > 0 && globalData.highlightPeopleId != Peopleid.none && peopleList[globalData.highlightPeopleId] != null){
		posX = peopleList[globalData.highlightPeopleId].data.posX;
		posY = peopleList[globalData.highlightPeopleId].data.posY;
	}
	else if (cityList.length > 0 && globalData.highlightCityId != Cityid.none && cityList[globalData.highlightCityId] != null && mapMain.data.cells[globalData.highlightPosX][globalData.highlightPosY].citybase == Citybase.center){
		posX = globalData.highlightPosX;
		posY = globalData.highlightPosY;
		var city = cityList[globalData.highlightCityId];
		for (var i=0; i<city.data.peoplealivelist.length; i++) {
			posPeopleX = peopleList[city.data.peoplealivelist[i]].data.posX;
			posPeopleY = peopleList[city.data.peoplealivelist[i]].data.posY;
			contextMap.fillStyle="orange";
			contextMap.fillRect(posPeopleX*cellSide, posPeopleY*cellSide, cellSide, 1);
			contextMap.fillRect(posPeopleX*cellSide, posPeopleY*cellSide, 1, cellSide);	
			contextMap.fillRect(posPeopleX*cellSide, (posPeopleY+1)*cellSide-1, cellSide, 1);
			contextMap.fillRect((posPeopleX+1)*cellSide-1, posPeopleY*cellSide, 1, cellSide);	
		}
		contextMap.fillStyle=getSeededRandomColor(32,255,city.data.id);
		for (var i=0; i<globalData.mapCellSize; i++){
			for (var j=0; j<globalData.mapCellSize; j++){
				if (mapMain.data.cells[i][j].cityculture == city.data.id) {
					contextMap.fillRect(i*cellSide+cellSide/2-1, j*cellSide+cellSide/2-1, 2, 2);
				}
			}
		}
	}
	else{
		posX = globalData.highlightPosX;
		posY = globalData.highlightPosY;
	}
	contextMap.fillStyle="red";
	contextMap.fillRect(posX*cellSide, posY*cellSide, cellSide, 1);
	contextMap.fillRect(posX*cellSide, posY*cellSide, 1, cellSide);	
	contextMap.fillRect(posX*cellSide, (posY+1)*cellSide-1, cellSide, 1);
	contextMap.fillRect((posX+1)*cellSide-1, posY*cellSide, 1, cellSide);	
}

//在右边显示重要信息
function showStatus() {
	//----
	document.getElementById("peoplecnt").innerHTML = "人数： " + peopleList.length + ' / ' + globalData.peoplealivelist.length;
	document.getElementById("citycnt").innerHTML = "城数： " + cityList.length + ' / ' + globalData.cityalivelist.length;
	document.getElementById("day").innerHTML = "天数： " + globalData.dayMain;
	document.getElementById("ageavg").innerHTML = "均寿： " + globalData.ageAverage;
	document.getElementById("combat").innerHTML = "战争： " + globalData.combatMain;
	document.getElementById("foodcnt").innerHTML = "野矿： " + globalData.foodCount;	
	if (globalData.highlightPeopleId != Peopleid.none && peopleList[globalData.highlightPeopleId] != null){
		document.getElementById("coord").innerHTML = "坐标： " + peopleList[globalData.highlightPeopleId].data.posX + " , " + peopleList[globalData.highlightPeopleId].data.posY;
		document.getElementById("food").innerHTML = "矿藏： " + mapMain.data.cells[peopleList[globalData.highlightPeopleId].data.posX][peopleList[globalData.highlightPeopleId].data.posY].rescount;	
		document.getElementById("culture").innerHTML = "文化： " + (mapMain.data.cells[peopleList[globalData.highlightPeopleId].data.posX][peopleList[globalData.highlightPeopleId].data.posY].cityculture != Cityid.none?cityList[mapMain.data.cells[peopleList[globalData.highlightPeopleId].data.posX][peopleList[globalData.highlightPeopleId].data.posY].cityculture].data.familyName:"-");	
		document.getElementById("cityname").innerHTML = "城市";
		document.getElementById("store").innerHTML = "储备";
		document.getElementById("citizen").innerHTML = "人口";
		document.getElementById("territory").innerHTML = "疆域";
		document.getElementById("citylevel").innerHTML = "等级";
		document.getElementById("peoplename").innerHTML = "村民： " + peopleList[globalData.highlightPeopleId].data.familyName + peopleList[globalData.highlightPeopleId].data.givenName;
		document.getElementById("carry").innerHTML = "携带： " + peopleList[globalData.highlightPeopleId].data.resource + " (" + peopleList[globalData.highlightPeopleId].data.starve + ")";
		document.getElementById("power").innerHTML = "战力： " + peopleList[globalData.highlightPeopleId].data.power + " (" + peopleList[globalData.highlightPeopleId].data.rescombat + ")";
		document.getElementById("collect").innerHTML = "采集： " + peopleList[globalData.highlightPeopleId].data.collect + " (" + peopleList[globalData.highlightPeopleId].data.rescollect + ")";
		document.getElementById("recycle").innerHTML = "回收： " + peopleList[globalData.highlightPeopleId].data.recycle + " (" + peopleList[globalData.highlightPeopleId].data.resrecycle + ")";
		document.getElementById("battle").innerHTML = "战斗： " + peopleList[globalData.highlightPeopleId].data.combatcount + " / " + peopleList[globalData.highlightPeopleId].data.combatcountwin;
		document.getElementById("age").innerHTML = "寿命： " + peopleList[globalData.highlightPeopleId].data.age;
		document.getElementById("revenue").innerHTML = "收益： " + (peopleList[globalData.highlightPeopleId].data.rescombat + peopleList[globalData.highlightPeopleId].data.rescollect + peopleList[globalData.highlightPeopleId].data.resrecycle) + " / " + peopleList[globalData.highlightPeopleId].data.resconsume;
	}	
	else if (globalData.highlightCityId != Cityid.none && cityList[globalData.highlightCityId] != null && mapMain.data.cells[globalData.highlightPosX][globalData.highlightPosY].citybase == Citybase.center){
		document.getElementById("coord").innerHTML = "坐标： " + globalData.highlightPosX.toString() + " " + globalData.highlightPosY.toString();
		document.getElementById("food").innerHTML = "矿藏： " + mapMain.data.cells[globalData.highlightPosX][globalData.highlightPosY].rescount;
		document.getElementById("culture").innerHTML = "文化： " + (mapMain.data.cells[globalData.highlightPosX][globalData.highlightPosY].cityculture != Cityid.none?cityList[mapMain.data.cells[globalData.highlightPosX][globalData.highlightPosY].cityculture].data.familyName:"-");
		document.getElementById("cityname").innerHTML = "城市： " + cityList[globalData.highlightCityId].data.familyName;
		document.getElementById("store").innerHTML = "储备： " + cityList[globalData.highlightCityId].data.resource;
		document.getElementById("citizen").innerHTML = "人口： " + cityList[globalData.highlightCityId].data.peoplealivelist.length;
		document.getElementById("territory").innerHTML = "疆域： " + cityList[globalData.highlightCityId].data.territory;
		document.getElementById("citylevel").innerHTML = "等级： " + cityList[globalData.highlightCityId].data.citySize;
		document.getElementById("peoplename").innerHTML = "村民";
		document.getElementById("carry").innerHTML = "携带";
		document.getElementById("power").innerHTML = "战力";
		document.getElementById("collect").innerHTML = "采集";
		document.getElementById("recycle").innerHTML = "回收";
		document.getElementById("battle").innerHTML = "战斗";
		document.getElementById("age").innerHTML = "寿命";		
		document.getElementById("revenue").innerHTML = "收益";
	}		
	else{
		document.getElementById("coord").innerHTML = "坐标： " + globalData.highlightPosX.toString() + " " + globalData.highlightPosY.toString();
		document.getElementById("food").innerHTML = "矿藏： " + mapMain.data.cells[globalData.highlightPosX][globalData.highlightPosY].rescount;	
		document.getElementById("culture").innerHTML = "文化： " + (mapMain.data.cells[globalData.highlightPosX][globalData.highlightPosY].cityculture != Cityid.none?cityList[mapMain.data.cells[globalData.highlightPosX][globalData.highlightPosY].cityculture].data.familyName:"-");
		document.getElementById("cityname").innerHTML = "城市";
		document.getElementById("store").innerHTML = "储备";
		document.getElementById("citizen").innerHTML = "人口";
		document.getElementById("territory").innerHTML = "疆域";
		document.getElementById("citylevel").innerHTML = "等级";
		document.getElementById("peoplename").innerHTML = "村民";
		document.getElementById("carry").innerHTML = "携带";
		document.getElementById("power").innerHTML = "战力";
		document.getElementById("collect").innerHTML = "采集";
		document.getElementById("recycle").innerHTML = "回收";
		document.getElementById("battle").innerHTML = "战斗";
		document.getElementById("age").innerHTML = "寿命";	
		document.getElementById("revenue").innerHTML = "收益";		
	}
	//----
}

function showTable() {
	var cellSide = Math.round(windowSizeMap / globalData.mapCellSize); //边长
	
	//城市表格
	//每次生成表格后，都生成新的排序实例，开销未知
	globalData.excel_city = null;	//销毁旧的实例

	var tab="<table_city>";
	tab += "<tr class=\"top\"><td>ID</td><td>城市</td><td>人口</td><td >等级</td><td>储备</td><td>疆域</td></tr>";

	if (globalData.highlightPeopleId != Peopleid.none && peopleList[globalData.highlightPeopleId] != null){
		var people = peopleList[globalData.highlightPeopleId];
		var city = cityList[people.data.cityid];
		//----
		tab+="<tr>";
		tab+="<td class=\"left_city\">" + city.data.id + "</td>";														//ID
		tab+="<td>" + city.data.familyName + "</td>";																//城市
		tab+="<td>" + city.data.peoplealivelist.length + "</td>";													//人口
		tab+="<td>" + city.data.citySize + "</td>";																	//等级
		tab+="<td>" + city.data.resource + "</td>";																	//储备
		tab+="<td>" + city.data.territory + "</td>";																//疆域
		tab+="</tr>";
		//----
	}
	else if (globalData.highlightCityId != Cityid.none && cityList[globalData.highlightCityId] != null && mapMain.data.cells[globalData.highlightPosX][globalData.highlightPosY].citybase == Citybase.center){
		var city = cityList[globalData.highlightCityId];
		//----
		tab+="<tr>";
		tab+="<td class=\"left_city\">" + city.data.id + "</td>";														//ID
		tab+="<td>" + city.data.familyName + "</td>";																//城市
		tab+="<td>" + city.data.peoplealivelist.length + "</td>";													//人口
		tab+="<td>" + city.data.citySize + "</td>";																	//等级
		tab+="<td>" + city.data.resource + "</td>";																	//储备
		tab+="<td>" + city.data.territory + "</td>";																//疆域
		tab+="</tr>";
		//----		
	}
	else {
		var showMax = TableRowMax;	//最多显示多少行
		for (var i=0; i<cityList.length && showMax>0; i++) {	
			if (cityList[i] != null && cityList[i].data.alive == Cityalive.yes) {
				showMax -= 1;
				var city = cityList[i];
				//----
				tab+="<tr>";
				tab+="<td class=\"left_city\">" + city.data.id + "</td>";														//ID
				tab+="<td>" + city.data.familyName + "</td>";																//城市
				tab+="<td>" + city.data.peoplealivelist.length + "</td>";													//人口
				tab+="<td>" + city.data.citySize + "</td>";																	//等级
				tab+="<td>" + city.data.resource + "</td>";																	//储备
				tab+="<td>" + city.data.territory + "</td>";																//疆域
				tab+="</tr>";
				//----		
			}
		}	
	}
	tab+="</table>";
	var table=document.getElementById("table_city");
	table.innerHTML=tab;
	
	globalData.excel_people = new tableSort('table_city',1,2,999,'up','down','hov'); //创建新的实例，能够排序
	
	//点击ID在地图上标识
	var elementsCity = document.getElementsByClassName("left_city");
	for (var k=0; k<elementsCity.length; k++) {
		elementsCity[k].index = k;
		elementsCity[k].selectId = Cityid.none;
		elementsCity[k].onclick = function(){
			this.selectId = elementsCity[this.index].innerHTML;	
			for (var i=0; i<globalData.mapCellSize; i++){
				for (var j=0; j<globalData.mapCellSize; j++){
					if (mapMain.data.cells[i][j].citybase == Citybase.center && mapMain.data.cells[i][j].cityid == this.selectId) {
						contextMap.beginPath();
						contextMap.arc((i+1/2)*cellSide,(j+1/2)*cellSide,cellSide*3/2,0,2*Math.PI);
						contextMap.lineWidth=5;
						contextMap.strokeStyle="orange";
						contextMap.stroke();//画空心圆
						contextMap.closePath();						
					}
				}
			}
		};
	}
	
	//居民表格
	//每次生成表格后，都生成新的排序实例，开销未知
	globalData.excel_people = null;	//销毁旧的实例

	var tab="<table_people>";
	tab += "<tr class=\"top\"><td>ID</td><td>村民</td><td>寿命</td><td >胜率</td><td>收益</td><td>战力</td><td>采集</td><td>回收</td><td>能力</td></tr>";

	if (globalData.highlightPeopleId != Peopleid.none && peopleList[globalData.highlightPeopleId] != null){
		var people = peopleList[globalData.highlightPeopleId];
		//----
		tab+="<tr>";
		tab+="<td class=\"left_people\">" + people.data.id + "</td>";																				//ID
		tab+="<td>" + people.data.familyName + people.data.givenName + "</td>";																//村民
		tab+="<td>" + people.data.age + "</td>";																							//寿命
		tab+="<td>" + (people.data.combatrate==null?"-":people.data.combatrate) + "</td>";													//胜率
		tab+="<td>" + (people.data.rescombat + people.data.rescollect + people.data.resrecycle + people.data.resconsume) + "</td>";			//收益
		tab+="<td>" + people.data.power + "</td>";																							//战力
		tab+="<td>" + people.data.collect + "</td>";																						//采集
		tab+="<td>" + people.data.recycle + "</td>";																						//回收
		tab+="<td>" + (people.data.power + people.data.collect + people.data.recycle) + "</td>";											//能力
		tab+="</tr>";
		//----
	}
	else if (globalData.highlightCityId != Cityid.none && cityList[globalData.highlightCityId] != null && mapMain.data.cells[globalData.highlightPosX][globalData.highlightPosY].citybase == Citybase.center){
		for (var i=0; i<Math.min(cityList[globalData.highlightCityId].data.peoplealivelist.length, TableRowMax); i++) {
			var people = peopleList[cityList[globalData.highlightCityId].data.peoplealivelist[i]];
			//----
			tab+="<tr>";
			tab+="<td class=\"left_people\">" + people.data.id + "</td>";																				//ID
			tab+="<td>" + people.data.familyName + people.data.givenName + "</td>";																//村民
			tab+="<td>" + people.data.age + "</td>";																							//寿命
			tab+="<td>" + (people.data.combatrate==null?"-":people.data.combatrate) + "</td>";													//胜率
			tab+="<td>" + (people.data.rescombat + people.data.rescollect + people.data.resrecycle + people.data.resconsume) + "</td>";			//收益
			tab+="<td>" + people.data.power + "</td>";																							//战力
			tab+="<td>" + people.data.collect + "</td>";																						//采集
			tab+="<td>" + people.data.recycle + "</td>";																						//回收
			tab+="<td>" + (people.data.power + people.data.collect + people.data.recycle) + "</td>";											//能力
			tab+="</tr>";
			//----
		}
	}
	else {
		for (var i=0; i<Math.min(globalData.peoplealivelist.length, TableRowMax); i++) {	
			var people = peopleList[globalData.peoplealivelist[i]];
			//----
			tab+="<tr>";
			tab+="<td class=\"left_people\">" + people.data.id + "</td>";																				//ID
			tab+="<td>" + people.data.familyName + people.data.givenName + "</td>";																//村民
			tab+="<td>" + people.data.age + "</td>";																							//寿命
			tab+="<td>" + (people.data.combatrate==null?"-":people.data.combatrate) + "</td>";													//胜率
			tab+="<td>" + (people.data.rescombat + people.data.rescollect + people.data.resrecycle + people.data.resconsume) + "</td>";			//收益
			tab+="<td>" + people.data.power + "</td>";																							//战力
			tab+="<td>" + people.data.collect + "</td>";																						//采集
			tab+="<td>" + people.data.recycle + "</td>";																						//回收
			tab+="<td>" + (people.data.power + people.data.collect + people.data.recycle) + "</td>";											//能力
			tab+="</tr>";
			//----
		}
	}
	tab+="</table>";
	var table=document.getElementById("table_people");
	table.innerHTML=tab;
	
	globalData.excel_people = new tableSort('table_people',1,2,999,'up','down','hov'); //创建新的实例，能够排序
	
	//点击ID在地图上标识
	var elementsPeople = document.getElementsByClassName("left_people");
	for (var k=0; k<elementsPeople.length; k++) {
		elementsPeople[k].index = k;
		elementsPeople[k].selectId = Peopleid.none;
		elementsPeople[k].onclick = function(){
			this.selectId = elementsPeople[this.index].innerHTML;	
			for (var i=0; i<globalData.mapCellSize; i++){
				for (var j=0; j<globalData.mapCellSize; j++){
					if (mapMain.data.cells[i][j].peopleid == this.selectId) {
						contextMap.beginPath();
						contextMap.arc((i+1/2)*cellSide,(j+1/2)*cellSide,cellSide*3/2,0,2*Math.PI);
						contextMap.lineWidth=5;
						contextMap.strokeStyle="red";
						contextMap.stroke();//画空心圆
						contextMap.closePath();						
					}
				}
			}
		};
	}	
}
