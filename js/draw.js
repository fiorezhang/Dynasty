// -- FUNCTION --
function initNewMap(){
	/*
	//清除list里已有元素信息，标记为no alive
	for (var i=0; i<cityList.length; i++){
		cityList[i].data.alive = Cityalive.no;
	}
	for (var i=0; i<peopleList.length; i++){
		peopleList[i].data.alive = Peoplealive.no;
	}	
	*/
	//清除list的ID标识并重新生成类
	City.idStatic = 0;
	cityList = new Array();
	People.idStatic = 0;
	peopleList = new Array();
	
	//日期归零
	globalData.dayMain = 0;

	globalData.mapCellSize = document.getElementById("size").value;

	//生成地图实例，并初始化湖泊矿产等等
	mapMain = new Map(globalData.mapCellSize);
	mapMain.init();

	//生成城市，以增量方式存放在list里面，list为了保证可索引必须唯一
	for (var i=0; i<globalData.cityNum; i++){
		var city = new City(Citysize.small);
		if (city.data.id != Cityid.none){
			cityList.push(city);
			//生成初始人口，以增量方式存放在list里面，所有的人口放在同一个list且list必须唯一
			for (var j=0; j<globalData.peopleNumCity; j++){
				var people = new People(city.data.id, Peopleresource.standard);
				if (people.data.id != Peopleid.none){
					peopleList.push(people);
				}				
			}
		}
	}
	
	//打印所有信息，可以关掉
	if (globalData.consoleLog == 1){
		console.log(mapMain);
		console.log(cityList);
		console.log(peopleList);
	}
	
	//Canavas画出来
	drawCells();	
	showHighlight();
}

//绘制整个地图，传进的参数有地图的实例，城市实例list，人口实例list等
function drawCells(){
    contextMap.clearRect(0,0,windowSizeMap,windowSizeMap);
	var cellSide = Math.round(windowSizeMap / globalData.mapCellSize); //边长
	//var cellRadius = Math.round(windowSizeMap / globalData.mapCellSize / 2);
    for (var i=0; i<globalData.mapCellSize; i++){
        for (var j=0; j<globalData.mapCellSize; j++){
			//绘制道路（道路在相邻格是重复记录的，画的时候只要画单个格子两个方向就够了，而且边框一圈的格子不会有道路）
			if (mapMain.data.cells[i][j].roadeast > Rdcount.none){
				var rgb = Math.ceil(mapMain.data.cells[i][j].roadeast*(16-255)/Rdcount.max + 255);	//根据道路计数器（近期走过的人次）计算出灰度深浅
				contextMap.fillStyle='#'+rgb.toString(16)+rgb.toString(16)+rgb.toString(16);
				contextMap.fillRect(i*cellSide+cellSide/2+1, j*cellSide+cellSide/2-1, cellSide-2, 2);	//宽度为2的道路
			}
			if (mapMain.data.cells[i][j].roadsouth > Rdcount.none){
				var rgb = Math.ceil(mapMain.data.cells[i][j].roadsouth*(16-255)/Rdcount.max + 255);
				contextMap.fillStyle='#'+rgb.toString(16)+rgb.toString(16)+rgb.toString(16);
				contextMap.fillRect(i*cellSide+cellSide/2-1, j*cellSide+cellSide/2+1, 2, cellSide-2);
			}		
			//绘制水
			if (mapMain.data.cells[i][j].terrain == Terrain.water){
				contextMap.fillStyle="DarkBlue";
				contextMap.fillRect(i*cellSide, j*cellSide, cellSide, cellSide);
			}
			//绘制资源
			if (mapMain.data.cells[i][j].resource == Resource.food){
				contextMap.fillStyle="yellow";	//食物，越多方块越大
				contextMap.fillRect(i*cellSide, j*cellSide, cellSide*mapMain.data.cells[i][j].rescount/Rescount.max, cellSide*mapMain.data.cells[i][j].rescount/Rescount.max);
			}
			//绘制城市
			if (mapMain.data.cells[i][j].citybase == Citybase.zone){
				var city = cityList[mapMain.data.cells[i][j].cityid];
				contextMap.fillStyle=getSeededRandomColor(16,255,city.data.id);
				contextMap.fillRect(i*cellSide, j*cellSide, cellSide, cellSide);
				contextMap.fillStyle="white";
				contextMap.fillRect(i*cellSide+2, j*cellSide+2, cellSide-4, cellSide-4);	//城市其它格子，空心颜色
			}
			if (mapMain.data.cells[i][j].citybase == Citybase.center){
				var city = cityList[mapMain.data.cells[i][j].cityid];
				contextMap.fillStyle=getSeededRandomColor(16,255,city.data.id);
				contextMap.fillRect(i*cellSide, j*cellSide, cellSide, cellSide);	//城市中心格子，实心颜色
			}		
			//绘制人
			if (mapMain.data.cells[i][j].peopleid != Peopleid.none){
				var vertexX = (i + 1/2) * cellSide;
				var vertexY = (j + 1/2) * cellSide;
			    //用中心颜色代表个人，周围代表部族
				var people = peopleList[mapMain.data.cells[i][j].peopleid];
				var city = cityList[people.data.cityid];
				var gradient = contextMap.createRadialGradient(vertexX, vertexY, Math.max(cellSide/8,1), vertexX, vertexY, cellSide/6);	//中心三分之一的个人颜色，到三分之二处是部族颜色
				gradient.addColorStop(0, getSeededRandomColor(16,255, people.data.id));
				gradient.addColorStop(1, getSeededRandomColor(16,255,city.data.id));
				contextMap.fillStyle = gradient;
				contextMap.beginPath();
				contextMap.arc(vertexX, vertexY, cellSide/2-1, 0, 2*Math.PI);
				contextMap.fill();
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
	if (peopleList.length > 0 && globalData.highlightPeopleId != Peopleid.none){
		posX = peopleList[globalData.highlightPeopleId].data.posX;
		posY = peopleList[globalData.highlightPeopleId].data.posY;
	}
	else if (cityList.length > 0 && globalData.highlightCityId != Cityid.none && mapMain.data.cells[globalData.highlightPosX][globalData.highlightPosY].citybase == Citybase.center){
		posX = globalData.highlightPosX;
		posY = globalData.highlightPosY;
		for (var i=0; i<cityList[globalData.highlightCityId].data.peopleidlist.length; i++) {
			posPeopleX = peopleList[cityList[globalData.highlightCityId].data.peopleidlist[i]].data.posX;
			posPeopleY = peopleList[cityList[globalData.highlightCityId].data.peopleidlist[i]].data.posY;
			contextMap.fillStyle="orange";
			contextMap.fillRect(posPeopleX*cellSide, posPeopleY*cellSide, cellSide, 1);
			contextMap.fillRect(posPeopleX*cellSide, posPeopleY*cellSide, 1, cellSide);	
			contextMap.fillRect(posPeopleX*cellSide, (posPeopleY+1)*cellSide-1, cellSide, 1);
			contextMap.fillRect((posPeopleX+1)*cellSide-1, posPeopleY*cellSide, 1, cellSide);	
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
	document.getElementById("peoplecnt").innerHTML = "人数： " + peopleList.length + ' / ' + globalData.peopleAlive;
	document.getElementById("citycnt").innerHTML = "城数： " + cityList.length + ' / ' + globalData.cityAlive;
	document.getElementById("day").innerHTML = "天数： " + globalData.dayMain;
	document.getElementById("ageavg").innerHTML = "均寿： " + globalData.ageAverage;
	document.getElementById("combat").innerHTML = "战争： " + globalData.combatMain;
	document.getElementById("foodcnt").innerHTML = "野矿： " + globalData.foodCount;	
	if (globalData.highlightPeopleId != Peopleid.none){
		document.getElementById("coord").innerHTML = "坐标： " + peopleList[globalData.highlightPeopleId].data.posX + " , " + peopleList[globalData.highlightPeopleId].data.posY;
		document.getElementById("food").innerHTML = "矿藏： " + mapMain.data.cells[peopleList[globalData.highlightPeopleId].data.posX][peopleList[globalData.highlightPeopleId].data.posY].rescount;	
		document.getElementById("cityname").innerHTML = "城市";
		document.getElementById("store").innerHTML = "储备";
		document.getElementById("citizen").innerHTML = "人口";
		document.getElementById("peoplename").innerHTML = "村民： " + peopleList[globalData.highlightPeopleId].data.familyName + peopleList[globalData.highlightPeopleId].data.givenName;
		document.getElementById("carry").innerHTML = "携带： " + peopleList[globalData.highlightPeopleId].data.resource + " (" + peopleList[globalData.highlightPeopleId].data.starve + ")";
		document.getElementById("power").innerHTML = "战力： " + peopleList[globalData.highlightPeopleId].data.power + " (" + peopleList[globalData.highlightPeopleId].data.rescombat + ")";
		document.getElementById("collect").innerHTML = "采集： " + peopleList[globalData.highlightPeopleId].data.collect + " (" + peopleList[globalData.highlightPeopleId].data.rescollect + ")";
		document.getElementById("recycle").innerHTML = "回收： " + peopleList[globalData.highlightPeopleId].data.recycle + " (" + peopleList[globalData.highlightPeopleId].data.resrecycle + ")";
		document.getElementById("battle").innerHTML = "战斗： " + peopleList[globalData.highlightPeopleId].data.combatcount + " / " + peopleList[globalData.highlightPeopleId].data.combatcountwin;
		document.getElementById("age").innerHTML = "寿命： " + peopleList[globalData.highlightPeopleId].data.age;
		document.getElementById("revenue").innerHTML = "收益： " + (peopleList[globalData.highlightPeopleId].data.rescombat + peopleList[globalData.highlightPeopleId].data.rescollect + peopleList[globalData.highlightPeopleId].data.resrecycle) + " / " + peopleList[globalData.highlightPeopleId].data.resconsume;
	}	
	else if (globalData.highlightCityId != Cityid.none && mapMain.data.cells[globalData.highlightPosX][globalData.highlightPosY].citybase == Citybase.center){
		document.getElementById("coord").innerHTML = "坐标： " + globalData.highlightPosX.toString() + " " + globalData.highlightPosY.toString();
		document.getElementById("food").innerHTML = "矿藏： " + mapMain.data.cells[globalData.highlightPosX][globalData.highlightPosY].rescount;
		document.getElementById("cityname").innerHTML = "城市： " + cityList[globalData.highlightCityId].data.familyName;
		document.getElementById("store").innerHTML = "储备： " + cityList[globalData.highlightCityId].data.resource;
		document.getElementById("citizen").innerHTML = "人口： " + cityList[globalData.highlightCityId].data.peopleidlist.length;
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
		document.getElementById("cityname").innerHTML = "城市";
		document.getElementById("store").innerHTML = "储备";
		document.getElementById("citizen").innerHTML = "人口";
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
	//TODO: 每次生成表格后，都生成新的排序实例，开销未知
	globalData.excel = null;	//销毁旧的实例

	var tab="<table>";
	tab += "<tr class=\"top\"><td>村民</td><td>寿命</td><td >胜率</td><td>收益</td><td>战力</td><td>采集</td><td>回收</td></tr>";

	if (globalData.highlightPeopleId != Peopleid.none){
		var people = peopleList[globalData.highlightPeopleId];
		//----
		tab+="<tr>"
		tab+="<td>" + people.data.familyName + people.data.givenName + "</td>";																//村民
		tab+="<td>" + people.data.age + "</td>";																							//寿命
		if (people.data.combatcount > 0){																									//胜率
			tab+="<td>" + Math.ceil(100*people.data.combatcountwin/people.data.combatcount) + "</td>";
		}
		else {
			tab+="<td>-</td>";
		}
		tab+="<td>" + (people.data.rescombat + people.data.rescollect + people.data.resrecycle + people.data.resconsume) + "</td>";			//收益
		tab+="<td>" + people.data.power + "</td>";																							//战力
		tab+="<td>" + people.data.collect + "</td>";																						//采集
		tab+="<td>" + people.data.recycle + "</td>";																						//回收
		tab+="</tr>"
		//----
	}
	else if (globalData.highlightCityId != Cityid.none && mapMain.data.cells[globalData.highlightPosX][globalData.highlightPosY].citybase == Citybase.center){
		for (var i=0; i<cityList[globalData.highlightCityId].data.peopleidlist.length; i++) {
			var people = peopleList[cityList[globalData.highlightCityId].data.peopleidlist[i]];
			//----
			tab+="<tr>"
			tab+="<td>" + people.data.familyName + people.data.givenName + "</td>";																//村民
			tab+="<td>" + people.data.age + "</td>";																							//寿命
			if (people.data.combatcount > 0){																									//胜率
				tab+="<td>" + Math.ceil(100*people.data.combatcountwin/people.data.combatcount) + "</td>";
			}
			else {
				tab+="<td>-</td>";
			}
			tab+="<td>" + (people.data.rescombat + people.data.rescollect + people.data.resrecycle + people.data.resconsume) + "</td>";			//收益
			tab+="<td>" + people.data.power + "</td>";																							//战力
			tab+="<td>" + people.data.collect + "</td>";																						//采集
			tab+="<td>" + people.data.recycle + "</td>";																						//回收
			tab+="</tr>"
			//----
		}
	}
	else {
		var showMax = 32;	//最多显示多少行
		for (var i=0; i<peopleList.length && showMax>0; i++) {	
			if (peopleList[i].data.alive == Peoplealive.yes) {
				showMax -= 1;
				var people = peopleList[i];
				//----
				tab+="<tr>"
				tab+="<td>" + people.data.familyName + people.data.givenName + "</td>";																//村民
				tab+="<td>" + people.data.age + "</td>";																							//寿命
				if (people.data.combatcount > 0){																									//胜率
					tab+="<td>" + Math.ceil(100*people.data.combatcountwin/people.data.combatcount) + "</td>";
				}
				else {
					tab+="<td>-</td>";
				}
				tab+="<td>" + (people.data.rescombat + people.data.rescollect + people.data.resrecycle + people.data.resconsume) + "</td>";			//收益
				tab+="<td>" + people.data.power + "</td>";																							//战力
				tab+="<td>" + people.data.collect + "</td>";																						//采集
				tab+="<td>" + people.data.recycle + "</td>";																						//回收
				tab+="</tr>"
				//----
			}
		}	
	}
	tab+="</table>";
	var table=document.getElementById("table");
	table.innerHTML=tab;
	
	globalData.excel = new tableSort('table',1,2,999,'up','down','hov'); //创建新的实例，能够排序
}

function updateAll(){
	//每回合更新地图
	mapMain.update(globalData.dayMain);
	globalData.foodCount = 0;
	for (var i=0; i<globalData.mapCellSize; i++){
        for (var j=0; j<globalData.mapCellSize; j++){
			//统计野外的矿的总数
			if (mapMain.data.cells[i][j].resource == Resource.food){
				globalData.foodCount += mapMain.data.cells[i][j].rescount;
			}
		}
	}

	//每回合更新各个城市，顺便统计数据
	globalData.cityAlive = 0;
	for (var i=0; i<cityList.length; i++){
		if (cityList[i].data.alive == Cityalive.yes){
			cityList[i].update(globalData.dayMain);
			globalData.cityAlive += 1;
		}
	}

	//每回合更新各个人，顺便统计数据
	var ageSum = 0;
	globalData.peopleAlive = 0;
	for (var i=0; i<peopleList.length; i++){
		if (peopleList[i].data.alive == Peoplealive.yes){
			peopleList[i].update(globalData.dayMain);
			globalData.peopleAlive += 1;
			ageSum += peopleList[i].data.age;
		}
	}
	if (globalData.peopleAlive > 0) {
		globalData.ageAverage = Math.ceil(ageSum / globalData.peopleAlive);
	}
	
}
