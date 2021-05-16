// -- FUNCTION --
//绘制整个地图，每个单元格按先后顺序，绘制道路，水，资源，城市，人，战争补给动作等。后画的会部分遮挡先画的。
function drawCells(){
    contextMap.clearRect(0,0,windowSizeMap,windowSizeMap);
	var cellSide = Math.round(windowSizeMap / glbData.mapCellSize); //边长
	//var cellRadius = Math.round(windowSizeMap / glbData.mapCellSize / 2);
    for (var i=0; i<glbData.mapCellSize; i++){
        for (var j=0; j<glbData.mapCellSize; j++){
			//绘制道路（道路在相邻格是重复记录的，画的时候只要画单个格子两个方向就够了，而且边框一圈的格子不会有道路）
			if (mapMain.data.cells[i][j].rdE > Rdcount.none){
				var rgb = Math.floor(mapMain.data.cells[i][j].rdE*(16-255)/Rdcount.max + 255);	//根据道路计数器（近期走过的人次）计算出灰度深浅
				contextMap.fillStyle='#'+rgb.toString(16)+rgb.toString(16)+rgb.toString(16);
				contextMap.fillRect(i*cellSide+cellSide/2+1, j*cellSide+cellSide/2-1, cellSide-2, 2);	//宽度为2的道路
			}
			if (mapMain.data.cells[i][j].rdS > Rdcount.none){
				var rgb = Math.floor(mapMain.data.cells[i][j].rdS*(64-255)/Rdcount.max + 255);	//颜色从64到255
				contextMap.fillStyle='#'+rgb.toString(16)+rgb.toString(16)+rgb.toString(16);
				contextMap.fillRect(i*cellSide+cellSide/2-1, j*cellSide+cellSide/2+1, 2, cellSide-2);
			}		
			//绘制水
			if (mapMain.data.cells[i][j].ter == Terrain.water){
				contextMap.fillStyle="darkslateblue";
				contextMap.fillRect(i*cellSide, j*cellSide, cellSide, cellSide);
			}
			//绘制资源
			if (mapMain.data.cells[i][j].resTp == ResType.food){
				contextMap.fillStyle="wheat";	//食物，越多方块越大
				var resSide = Math.ceil(cellSide*mapMain.data.cells[i][j].resCt/ResCount.max);
				contextMap.fillRect(i*cellSide+Math.floor((cellSide-resSide)/2), j*cellSide+Math.floor((cellSide-resSide)/2), resSide, resSide);
			}
			//绘制城市
			if (mapMain.data.cells[i][j].cBase == CityBase.zone){
				var city = cityList[mapMain.data.cells[i][j].cId];
				contextMap.fillStyle=getSeededRandomColor(96,255,city.data.cult);
				contextMap.fillRect(i*cellSide, j*cellSide, cellSide, cellSide);
				contextMap.fillStyle=getSeededRandomColor(96,255,city.data.id);
				contextMap.fillRect(i*cellSide+2, j*cellSide+2, cellSide-4, cellSide-4);	//城市其它格子，中心颜色代表ID
			}
			if (mapMain.data.cells[i][j].cBase == CityBase.center){
				var city = cityList[mapMain.data.cells[i][j].cId];
				contextMap.fillStyle=getSeededRandomColor(96,255,city.data.id);
				contextMap.fillRect(i*cellSide+2, j*cellSide+2, cellSide-4, cellSide-4);	//城市中心格子，实心颜色
			}		
			//绘制人
			if (mapMain.data.cells[i][j].pId != PeopleId.none){
				var vertexX = (i + 1/2) * cellSide;
				var vertexY = (j + 1/2) * cellSide;
			    //用中心颜色代表个人，周围代表部族
				var people = peopleList[mapMain.data.cells[i][j].pId];
				var city = cityList[people.data.cId];
				var gradient = contextMap.createRadialGradient(vertexX, vertexY, Math.max(cellSide/8,1), vertexX, vertexY, cellSide/6);	//中心四分之一的城市颜色，到三分之一处是部族颜色
				gradient.addColorStop(0, getSeededRandomColor(96,255,city.data.id));
				gradient.addColorStop(1, getSeededRandomColor(96,255,city.data.cult));
				contextMap.fillStyle = gradient;
				contextMap.beginPath();
				contextMap.arc(vertexX, vertexY, cellSide/2-1, 0, 2*Math.PI);
				contextMap.fill();
			}			
			//绘制文化
			if (mapMain.data.cells[i][j].cCult != CityCult.none){
				var city = cityList[mapMain.data.cells[i][j].cCult];
				contextMap.fillStyle=getSeededRandomColor(96,255,city.data.cult);
				if (i>=1 && mapMain.data.cells[i][j].cCult != mapMain.data.cells[i-1][j].cCult){
					contextMap.fillRect(i*cellSide, (j+1/4)*cellSide, 1, cellSide/2);
				}
				if (i<glbData.mapCellSize-1 && mapMain.data.cells[i][j].cCult != mapMain.data.cells[i+1][j].cCult){
					contextMap.fillRect((i+1)*cellSide-1, (j+1/4)*cellSide, 1, cellSide/2);
				}
				if (j>=1 && mapMain.data.cells[i][j].cCult != mapMain.data.cells[i][j-1].cCult){
					contextMap.fillRect((i+1/4)*cellSide, j*cellSide, cellSide/2, 1);
				}
				if (j<glbData.mapCellSize-1 && mapMain.data.cells[i][j].cCult != mapMain.data.cells[i][j+1].cCult){
					contextMap.fillRect((i+1/4)*cellSide, (j+1)*cellSide-1, cellSide/2, 1);
				}				
			}						
			//绘制战争和补给
			if (mapMain.data.cells[i][j].pId != PeopleId.none){
				var people = peopleList[mapMain.data.cells[i][j].pId];
				
				if (people.data.cbtDir == Direct.west){
					contextMap.fillStyle="magenta";
					contextMap.fillRect(i*cellSide, j*cellSide+cellSide/2-3, cellSide/2, 6);
				}
				else if (people.data.cbtDir == Direct.east){
					contextMap.fillStyle="magenta";
					contextMap.fillRect(i*cellSide+cellSide/2, j*cellSide+cellSide/2-3, cellSide/2, 6);
				}
				else if (people.data.cbtDir == Direct.north){
					contextMap.fillStyle="magenta";
					contextMap.fillRect(i*cellSide+cellSide/2-3, j*cellSide, 6, cellSide/2);
				}
				else if (people.data.cbtDir == Direct.south){
					contextMap.fillStyle="magenta";
					contextMap.fillRect(i*cellSide+cellSide/2-3, j*cellSide+cellSide/2, 6, cellSide/2);
				}
				
				if (people.data.feedDir == Direct.west){
					contextMap.fillStyle="greenyellow";
					contextMap.fillRect(i*cellSide, j*cellSide+cellSide/2-3, cellSide/2, 6);
				}
				else if (people.data.feedDir == Direct.east){
					contextMap.fillStyle="greenyellow";
					contextMap.fillRect(i*cellSide+cellSide/2, j*cellSide+cellSide/2-3, cellSide/2, 6);
				}
				else if (people.data.feedDir == Direct.north){
					contextMap.fillStyle="greenyellow";
					contextMap.fillRect(i*cellSide+cellSide/2-3, j*cellSide, 6, cellSide/2);
				}
				else if (people.data.feedDir == Direct.south){
					contextMap.fillStyle="greenyellow";
					contextMap.fillRect(i*cellSide+cellSide/2-3, j*cellSide+cellSide/2, 6, cellSide/2);
				}
			}
        }
    }
}

function drawMapMode() {
	//仅限调试模式，绘制全疆域
	if ((glbData.debug & Debug.mapMode) > 0) {
		var cellSide = Math.round(windowSizeMap / glbData.mapCellSize); //边长
		//var cellRadius = Math.round(windowSizeMap / glbData.mapCellSize / 2);
		for (var i=0; i<glbData.mapCellSize; i++){
			for (var j=0; j<glbData.mapCellSize; j++){				
				if (mapMain.data.cells[i][j].cCult != CityCult.none){
					var city = cityList[mapMain.data.cells[i][j].cCult];
					contextMap.fillStyle=getSeededRandomColor(96,255,city.data.cult);
					contextMap.fillRect(i*cellSide+1, j*cellSide+1, cellSide-2, cellSide-2);
					contextMap.fillStyle="black";
					if (i>=1 && mapMain.data.cells[i][j].cCult != mapMain.data.cells[i-1][j].cCult){
						contextMap.fillRect(i*cellSide, (j+1/4)*cellSide, 1, cellSide/2);
					}
					if (i<glbData.mapCellSize-1 && mapMain.data.cells[i][j].cCult != mapMain.data.cells[i+1][j].cCult){
						contextMap.fillRect((i+1)*cellSide-1, (j+1/4)*cellSide, 1, cellSide/2);
					}
					if (j>=1 && mapMain.data.cells[i][j].cCult != mapMain.data.cells[i][j-1].cCult){
						contextMap.fillRect((i+1/4)*cellSide, j*cellSide, cellSide/2, 1);
					}
					if (j<glbData.mapCellSize-1 && mapMain.data.cells[i][j].cCult != mapMain.data.cells[i][j+1].cCult){
						contextMap.fillRect((i+1/4)*cellSide, (j+1)*cellSide-1, cellSide/2, 1);
					}				
				}
			}
		}
		for (var i=0; i<cityList.length; i++) {
			var city = cityList[i];
			if (city != null && city.data.id == city.data.cult) {	//主城
				contextMap.font="75px KaiTi";
				contextMap.textAlign="center";
				contextMap.textBaseline="middle";
				contextMap.fillStyle="black";
				contextMap.fillText(city.data.fmName, city.data.posX*cellSide, city.data.posY*cellSide);//字写到主城中心
			}
			else if (city != null){	//分城
				contextMap.font="bold italic 30px KaiTi";
				contextMap.textAlign="center";
				contextMap.textBaseline="middle";
				contextMap.fillStyle="black";
				contextMap.fillText(city.data.cityName, city.data.posX*cellSide, city.data.posY*cellSide);//字写到主城中心				
			}
		}
	}
}

//保存Canvas图片，连续多张
function recordMap() {
	if ((glbData.debug & Debug.recordMap) > 0 && glbData.dayMain % DayRecordMap == 0) {
		var imgData = canavasMap.toDataURL("image/png").replace("image/png", "image/octet-stream");
		//window.location.href = image;
		// 下载后的问题名
		var  filename =  'map_'  + PrefixInteger(Math.floor(glbData.dayMain/DayRecordMap), 5) +  '.png';
		// download
		saveFile(imgData,filename);
	}
}

function showHighlight() {
	if ((glbData.debug & Debug.recordMap) == 0) { //录像的时候不要画高光
		//绘制高亮记号（仅用于调试）
		var posX, posY;
		var cellSide = Math.round(windowSizeMap / glbData.mapCellSize); //边长
		if (peopleList.length > 0 && glbData.hltPeopleId != PeopleId.none && peopleList[glbData.hltPeopleId] != null){
			posX = peopleList[glbData.hltPeopleId].data.posX;
			posY = peopleList[glbData.hltPeopleId].data.posY;
		}
		else if (cityList.length > 0 && glbData.hltCityId != CityId.none && cityList[glbData.hltCityId] != null && mapMain.data.cells[glbData.hltPoint.posX][glbData.hltPoint.posY].cBase == CityBase.center){
			posX = glbData.hltPoint.posX;
			posY = glbData.hltPoint.posY;
			var city = cityList[glbData.hltCityId];
			for (var i=0; i<city.data.pAliveList.length; i++) {
				posPeopleX = peopleList[city.data.pAliveList[i]].data.posX;
				posPeopleY = peopleList[city.data.pAliveList[i]].data.posY;
				contextMap.fillStyle="orange";
				contextMap.fillRect(posPeopleX*cellSide, posPeopleY*cellSide, cellSide, 1);
				contextMap.fillRect(posPeopleX*cellSide, posPeopleY*cellSide, 1, cellSide);	
				contextMap.fillRect(posPeopleX*cellSide, (posPeopleY+1)*cellSide-1, cellSide, 1);
				contextMap.fillRect((posPeopleX+1)*cellSide-1, posPeopleY*cellSide, 1, cellSide);	
			}
			contextMap.fillStyle=getSeededRandomColor(96,255,city.data.cult);
			for (var i=0; i<glbData.mapCellSize; i++){
				for (var j=0; j<glbData.mapCellSize; j++){
					if (mapMain.data.cells[i][j].cCult == city.data.cult) {
						contextMap.fillRect(i*cellSide+cellSide/2-1, j*cellSide+cellSide/2-1, 2, 2);
					}
				}
			}
		}
		else{
			posX = glbData.hltPoint.posX;
			posY = glbData.hltPoint.posY;
		}
		contextMap.fillStyle="red";
		contextMap.fillRect(posX*cellSide, posY*cellSide, cellSide, 1);
		contextMap.fillRect(posX*cellSide, posY*cellSide, 1, cellSide);	
		contextMap.fillRect(posX*cellSide, (posY+1)*cellSide-1, cellSide, 1);
		contextMap.fillRect((posX+1)*cellSide-1, posY*cellSide, 1, cellSide);	
	}
}

//在右边显示重要信息
function showStatus() {
	document.getElementById("peoplecnt").innerHTML = "人数： " + peopleList.length + ' / ' + glbData.pAliveList.length;
	document.getElementById("citycnt").innerHTML = "城数： " + cityList.length + ' / ' + glbData.cAliveList.length;
	document.getElementById("day").innerHTML = "天数： " + glbData.dayMain;
	document.getElementById("ageavg").innerHTML = "均寿： " + glbData.ageAverage;
	document.getElementById("combat").innerHTML = "战争： " + glbData.combatMain;
	document.getElementById("foodcnt").innerHTML = "野矿： " + glbData.foodCount;	
	if (glbData.hltPeopleId != PeopleId.none && peopleList[glbData.hltPeopleId] != null){
		document.getElementById("coord").innerHTML = "坐标： " + peopleList[glbData.hltPeopleId].data.posX + " , " + peopleList[glbData.hltPeopleId].data.posY;
		document.getElementById("food").innerHTML = "矿藏： " + mapMain.data.cells[peopleList[glbData.hltPeopleId].data.posX][peopleList[glbData.hltPeopleId].data.posY].resCt;	
		document.getElementById("culture").innerHTML = "文化： " + (mapMain.data.cells[peopleList[glbData.hltPeopleId].data.posX][peopleList[glbData.hltPeopleId].data.posY].cCult != CityCult.none?cityList[mapMain.data.cells[peopleList[glbData.hltPeopleId].data.posX][peopleList[glbData.hltPeopleId].data.posY].cCult].data.fmName:"-");	
		document.getElementById("cityname").innerHTML = "城市";
		document.getElementById("citycult").innerHTML = "文化";
		document.getElementById("store").innerHTML = "储备";
		document.getElementById("citizen").innerHTML = "人口";
		document.getElementById("territory").innerHTML = "疆域";
		document.getElementById("citylevel").innerHTML = "等级";
		document.getElementById("peoplename").innerHTML = "村民： " + peopleList[glbData.hltPeopleId].data.fmName + peopleList[glbData.hltPeopleId].data.gvName;
		document.getElementById("carry").innerHTML = "携带： " + peopleList[glbData.hltPeopleId].data.resCt + " (" + peopleList[glbData.hltPeopleId].data.starve + ")";
		document.getElementById("power").innerHTML = "战力： " + peopleList[glbData.hltPeopleId].data.power + " (" + peopleList[glbData.hltPeopleId].data.resCombat + ")";
		document.getElementById("collect").innerHTML = "采集： " + peopleList[glbData.hltPeopleId].data.collect + " (" + peopleList[glbData.hltPeopleId].data.resCollect + ")";
		document.getElementById("recycle").innerHTML = "回收： " + peopleList[glbData.hltPeopleId].data.recycle + " (" + peopleList[glbData.hltPeopleId].data.resRecycle + ")";
		document.getElementById("battle").innerHTML = "战斗： " + peopleList[glbData.hltPeopleId].data.cbtCt + " / " + peopleList[glbData.hltPeopleId].data.cbtWn;
		document.getElementById("age").innerHTML = "寿命： " + peopleList[glbData.hltPeopleId].data.age;
		document.getElementById("revenue").innerHTML = "收益： " + (peopleList[glbData.hltPeopleId].data.resCombat + peopleList[glbData.hltPeopleId].data.resCollect + peopleList[glbData.hltPeopleId].data.resRecycle) + " / " + peopleList[glbData.hltPeopleId].data.resConsume;
	}	
	else if (glbData.hltCityId != CityId.none && cityList[glbData.hltCityId] != null && mapMain.data.cells[glbData.hltPoint.posX][glbData.hltPoint.posY].cBase == CityBase.center){
		document.getElementById("coord").innerHTML = "坐标： " + glbData.hltPoint.posX.toString() + " " + glbData.hltPoint.posY.toString();
		document.getElementById("food").innerHTML = "矿藏： " + mapMain.data.cells[glbData.hltPoint.posX][glbData.hltPoint.posY].resCt;
		document.getElementById("culture").innerHTML = "文化： " + (mapMain.data.cells[glbData.hltPoint.posX][glbData.hltPoint.posY].cCult != CityCult.none?cityList[mapMain.data.cells[glbData.hltPoint.posX][glbData.hltPoint.posY].cCult].data.fmName:"-");
		document.getElementById("cityname").innerHTML = "城市： " + cityList[glbData.hltCityId].data.cityName;
		document.getElementById("citycult").innerHTML = "文化： " + cityList[glbData.hltCityId].data.fmName;
		document.getElementById("store").innerHTML = "储备： " + cityList[glbData.hltCityId].data.resCt;
		document.getElementById("citizen").innerHTML = "人口： " + cityList[glbData.hltCityId].data.pAliveList.length;
		document.getElementById("territory").innerHTML = "疆域： " + cityList[glbData.hltCityId].data.territory;
		document.getElementById("citylevel").innerHTML = "等级： " + cityList[glbData.hltCityId].data.citySize;
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
		document.getElementById("coord").innerHTML = "坐标： " + glbData.hltPoint.posX.toString() + " " + glbData.hltPoint.posY.toString();
		document.getElementById("food").innerHTML = "矿藏： " + mapMain.data.cells[glbData.hltPoint.posX][glbData.hltPoint.posY].resCt;	
		document.getElementById("culture").innerHTML = "文化： " + (mapMain.data.cells[glbData.hltPoint.posX][glbData.hltPoint.posY].cCult != CityCult.none?cityList[mapMain.data.cells[glbData.hltPoint.posX][glbData.hltPoint.posY].cCult].data.fmName:"-");
		document.getElementById("cityname").innerHTML = "城市";
		document.getElementById("citycult").innerHTML = "文化";
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
}

function showTable() {
	var cellSide = Math.round(windowSizeMap / glbData.mapCellSize); //边长
	
	//城市表格
	//每次生成表格后，都生成新的排序实例，开销未知
	glbData.excelCity = null;	//销毁旧的实例

	var tab="<table_city>";
	tab += "<tr class=\"top\"><td>ID</td><td>文化</td><td>城市</td><td>人口</td><td >等级</td><td>储备</td><td>疆域</td></tr>";

	if (glbData.hltPeopleId != PeopleId.none && peopleList[glbData.hltPeopleId] != null){
		var people = peopleList[glbData.hltPeopleId];
		var city = cityList[people.data.cId];
		//----
		tab+="<tr>";
		tab+="<td class=\"left_city\">" + city.data.id + "</td>";														//ID
		tab+="<td>" + city.data.fmName + "</td>";																//文化
		tab+="<td>" + city.data.cityName + "</td>";																//城市
		tab+="<td>" + city.data.pAliveList.length + "</td>";													//人口
		tab+="<td>" + city.data.citySize + "</td>";																	//等级
		tab+="<td>" + city.data.resCt + "</td>";																	//储备
		tab+="<td>" + city.data.territory + "</td>";																//疆域
		tab+="</tr>";
		//----
	}
	else if (glbData.hltCityId != CityId.none && cityList[glbData.hltCityId] != null && mapMain.data.cells[glbData.hltPoint.posX][glbData.hltPoint.posY].cBase == CityBase.center){
		var showMax = TableRowMax;	//最多显示多少行
		for (var i=0; i<cityList.length && showMax>0; i++) {	
			if (cityList[i] != null && cityList[i].data.cult == cityList[glbData.hltCityId].data.cult) {
				showMax -= 1;
				var city = cityList[i];
				//----
				tab+="<tr>";
				tab+="<td class=\"left_city\">" + city.data.id + "</td>";														//ID
				tab+="<td>" + city.data.fmName + "</td>";																//文化
				tab+="<td>" + city.data.cityName + "</td>";																//城市
				tab+="<td>" + city.data.pAliveList.length + "</td>";													//人口
				tab+="<td>" + city.data.citySize + "</td>";																	//等级
				tab+="<td>" + city.data.resCt + "</td>";																	//储备
				tab+="<td>" + city.data.territory + "</td>";																//疆域
				tab+="</tr>";
				//----		
			}
		}
	}
	else if ((glbData.hltPoint.posX == 0 || glbData.hltPoint.posX == glbData.mapCellSize-1) && (glbData.hltPoint.posY == 0 || glbData.hltPoint.posY == glbData.mapCellSize-1)){
		var showMax = TableRowMax;	//最多显示多少行
		for (var i=0; i<cityList.length && showMax>0; i++) {	
			if (cityList[i] != null && cityList[i].data.alive == CityAlive.yes) {
				showMax -= 1;
				var city = cityList[i];
				//----
				tab+="<tr>";
				tab+="<td class=\"left_city\">" + city.data.id + "</td>";														//ID
				tab+="<td>" + city.data.fmName + "</td>";																//文化
				tab+="<td>" + city.data.cityName + "</td>";																//城市
				tab+="<td>" + city.data.pAliveList.length + "</td>";													//人口
				tab+="<td>" + city.data.citySize + "</td>";																	//等级
				tab+="<td>" + city.data.resCt + "</td>";																	//储备
				tab+="<td>" + city.data.territory + "</td>";																//疆域
				tab+="</tr>";
				//----		
			}
		}	
	}
	tab+="</table>";
	var table = document.getElementById("table_city");
	table.innerHTML=tab;
	
	glbData.excelPeople = new tableSort('table_city',1,2,999,'up','down','hov'); //创建新的实例，能够排序
	
	//点击ID在地图上标识
	var elementsCity = document.getElementsByClassName("left_city");
	for (var k=0; k<elementsCity.length; k++) {
		elementsCity[k].index = k;
		elementsCity[k].selectId = CityId.none;
		elementsCity[k].onclick = function(){
			this.selectId = elementsCity[this.index].innerHTML;	
			for (var i=0; i<glbData.mapCellSize; i++){
				for (var j=0; j<glbData.mapCellSize; j++){
					if (mapMain.data.cells[i][j].cBase == CityBase.center && mapMain.data.cells[i][j].cId == this.selectId) {
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
	glbData.excelPeople = null;	//销毁旧的实例

	var tab="<table_people>";
	tab += "<tr class=\"top\"><td>ID</td><td>村民</td><td>寿命</td><td >胜率</td><td>收益</td><td>战力</td><td>采集</td><td>回收</td><td>能力</td></tr>";

	if (glbData.hltPeopleId != PeopleId.none && peopleList[glbData.hltPeopleId] != null){
		var people = peopleList[glbData.hltPeopleId];
		//----
		tab+="<tr>";
		tab+="<td class=\"left_people\">" + people.data.id + "</td>";																				//ID
		tab+="<td>" + people.data.fmName + people.data.gvName + "</td>";																//村民
		tab+="<td>" + people.data.age + "</td>";																							//寿命
		tab+="<td>" + (people.data.cbtWR==null?"-":people.data.cbtWR) + "</td>";													//胜率
		tab+="<td>" + (people.data.resCombat + people.data.resCollect + people.data.resRecycle + people.data.resConsume) + "</td>";			//收益
		tab+="<td>" + people.data.power + "</td>";																							//战力
		tab+="<td>" + people.data.collect + "</td>";																						//采集
		tab+="<td>" + people.data.recycle + "</td>";																						//回收
		tab+="<td>" + (people.data.power + people.data.collect + people.data.recycle) + "</td>";											//能力
		tab+="</tr>";
		//----
	}
	else if (glbData.hltCityId != CityId.none && cityList[glbData.hltCityId] != null && mapMain.data.cells[glbData.hltPoint.posX][glbData.hltPoint.posY].cBase == CityBase.center){
		for (var i=0; i<Math.min(cityList[glbData.hltCityId].data.pAliveList.length, TableRowMax); i++) {
			var people = peopleList[cityList[glbData.hltCityId].data.pAliveList[i]];
			//----
			tab+="<tr>";
			tab+="<td class=\"left_people\">" + people.data.id + "</td>";																				//ID
			tab+="<td>" + people.data.fmName + people.data.gvName + "</td>";																//村民
			tab+="<td>" + people.data.age + "</td>";																							//寿命
			tab+="<td>" + (people.data.cbtWR==null?"-":people.data.cbtWR) + "</td>";													//胜率
			tab+="<td>" + (people.data.resCombat + people.data.resCollect + people.data.resRecycle + people.data.resConsume) + "</td>";			//收益
			tab+="<td>" + people.data.power + "</td>";																							//战力
			tab+="<td>" + people.data.collect + "</td>";																						//采集
			tab+="<td>" + people.data.recycle + "</td>";																						//回收
			tab+="<td>" + (people.data.power + people.data.collect + people.data.recycle) + "</td>";											//能力
			tab+="</tr>";
			//----
		}
	}
	else if ((glbData.hltPoint.posX == 0 || glbData.hltPoint.posX == glbData.mapCellSize-1) && (glbData.hltPoint.posY == 0 || glbData.hltPoint.posY == glbData.mapCellSize-1)){
		for (var i=0; i<Math.min(glbData.pAliveList.length, TableRowMax); i++) {	
			var people = peopleList[glbData.pAliveList[i]];
			//----
			tab+="<tr>";
			tab+="<td class=\"left_people\">" + people.data.id + "</td>";																				//ID
			tab+="<td>" + people.data.fmName + people.data.gvName + "</td>";																//村民
			tab+="<td>" + people.data.age + "</td>";																							//寿命
			tab+="<td>" + (people.data.cbtWR==null?"-":people.data.cbtWR) + "</td>";													//胜率
			tab+="<td>" + (people.data.resCombat + people.data.resCollect + people.data.resRecycle + people.data.resConsume) + "</td>";			//收益
			tab+="<td>" + people.data.power + "</td>";																							//战力
			tab+="<td>" + people.data.collect + "</td>";																						//采集
			tab+="<td>" + people.data.recycle + "</td>";																						//回收
			tab+="<td>" + (people.data.power + people.data.collect + people.data.recycle) + "</td>";											//能力
			tab+="</tr>";
			//----
		}
	}
	tab+="</table>";
	var table = document.getElementById("table_people");
	table.innerHTML=tab;
	
	glbData.excelPeople = new tableSort('table_people',1,2,999,'up','down','hov'); //创建新的实例，能够排序
	
	//点击ID在地图上标识
	var elementsPeople = document.getElementsByClassName("left_people");
	for (var k=0; k<elementsPeople.length; k++) {
		elementsPeople[k].index = k;
		elementsPeople[k].selectId = PeopleId.none;
		elementsPeople[k].onclick = function(){
			this.selectId = elementsPeople[this.index].innerHTML;	
			for (var i=0; i<glbData.mapCellSize; i++){
				for (var j=0; j<glbData.mapCellSize; j++){
					if (mapMain.data.cells[i][j].pId == this.selectId) {
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

function addBio(string) {
	var bioHandle = document.getElementById("biography");
	bioHandle.innerHTML += "太初" + PrefixInteger(Math.floor(glbData.dayMain/100), 4) + "年" + PrefixInteger(glbData.dayMain%100, 2) + "日，" + string + "\n";
	bioHandle.scrollTop = bioHandle.scrollHeight;
	glbData.bio = bioHandle.innerHTML;
}

function loadBio() {
	var bioHandle = document.getElementById("biography");
	bioHandle.innerHTML = glbData.bio;
}