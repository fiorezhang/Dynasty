class City{
	static idStatic = 0;
	
	constructor(size){
		this.data = {'posX':0, 'posY':0, 'alive':CityAlive.no, 'resCt':0, 'dayNext':DayPeople, 'citySize':0, 'id':CityId.none, 'fmName':'', 'territory':0, 'pAliveList':null, 'resCellList':null};
		
		if (size == CitySize.none){	//专门设计给读档
			City.idStatic += 1;
			return;
		}

		//随机生成城市中心点，预留最大城市范围，碰撞检测是否与湖，资源，其它城市重叠
		var countRetry = 0;		
		var maxRetry = 1000;
		var cityConflict = 0;
		//var cityBoundary = CitySize.big + 1;
		var cityBoundary = CitySize.big;
		do{
			cityConflict = 0;
			this.data.posX = getRandom(0+cityBoundary, mapMain.data.cellSize-cityBoundary);
			this.data.posY = getRandom(0+cityBoundary, mapMain.data.cellSize-cityBoundary);
			//console.log(this.data.posX);
			//console.log(this.data.posY);

			for (var i=-cityBoundary; i<=cityBoundary; i++){
				for (var j=-cityBoundary; j<=cityBoundary; j++){
				if (mapMain.data.cells[this.data.posX+i][this.data.posY+j].ter != Terrain.none || mapMain.data.cells[this.data.posX+i][this.data.posY+j].resTp != ResType.none || mapMain.data.cells[this.data.posX+i][this.data.posY+j].cBase > CityBase.none){
						cityConflict = 1;
						break;
					}
				}
				if (cityConflict == 1){
					break;
				}
			}
			countRetry += 1;
		}while(cityConflict == 1 && countRetry < maxRetry);		
		
		//console.log(countRetry, this.data.posX, this.data.posY);
		
		if (countRetry >= maxRetry){
			this.data.id = CityId.none;
			return;
		}
		
		//确认城市中心点后，根据输入的城市尺寸，更新地图cell信息；生成唯一id
		this.data.citySize = size;		
		this.data.alive = CityAlive.yes;
		this.data.id = City.idStatic;
		City.idStatic += 1;				
		//console.log(this.data.id);		
		this.data.fmName = getFamilyName();
		this.data.dayNext = getRandom(1, DayPeople*2);
		
		for (var i=-CitySize.big; i<=CitySize.big; i++){
			for (var j=-CitySize.big; j<=CitySize.big; j++){
				mapMain.data.cells[this.data.posX+i][this.data.posY+j].cBase = CityBase.reserve;
			}
		}
		for (var i=-this.data.citySize; i<=this.data.citySize; i++){
			for (var j=-this.data.citySize; j<=this.data.citySize; j++){
				mapMain.data.cells[this.data.posX+i][this.data.posY+j].cBase = CityBase.zone;
				mapMain.data.cells[this.data.posX+i][this.data.posY+j].cId = this.data.id;
				mapMain.data.cells[this.data.posX+i][this.data.posY+j].cCult = this.data.id;
			}
		}
		mapMain.data.cells[this.data.posX][this.data.posY].cBase = CityBase.center;
		
		//城市初始资源
		if (this.data.citySize == CitySize.small) {
			this.data.resCt = CityResCt.small;
		}
		else if (this.data.citySize == CitySize.middle) {
			this.data.resCt = CityResCt.middle;
		}
		else if (this.data.citySize == CitySize.big) {
			this.data.resCt = CityResCt.big;
		}
		
		//建立城市人口list
		this.data.pAliveList = new Array();
		
		//建立资源list
		this.data.resCellList = new Array();
		
		glbData.cAliveList.push(this.data.id);
	}
	
	update(day){
		var peopleBorn = 0;	//标记是否本轮生成市民
		//间隔一段时间，如果有足够资源，生成新的市民
		if (day >= this.data.dayNext && this.data.pAliveList.length < PeopleNumIndex * this.data.citySize && this.data.resCt >= PeopleResCt.starve) {	//城市容纳人数为8x城市大小
			var resourceBorn = Math.min(this.data.resCt, PeopleResCt.standard);
			var people = new People(this.data.id, resourceBorn);
			if (people.data.id != PeopleId.none){	//成功生成
				peopleBorn = 1;
				peopleList.push(people);
				this.data.resCt -= resourceBorn;
				this.data.dayNext = day + getRandom(1, DayPeople*2);	//随机指定下一个生成市民的天数，平均值为设定的天数
			}	
		}
		
		//计算城市文化疆域
		this.data.territory = 0;
		for (var i=0; i<glbData.mapCellSize; i++){
			for (var j=0; j<glbData.mapCellSize; j++){
				if (mapMain.data.cells[i][j].cCult == this.data.id) {
					this.data.territory += 1;
				}
			}
		}
		
		//升级城市
		var citySizeChange = 0;
		if (this.data.citySize == CitySize.small && this.data.resCt > CityResCt.middle) {
			this.data.citySize = CitySize.middle;
			citySizeChange = 1;
		}
		if (this.data.citySize == CitySize.middle && this.data.resCt > CityResCt.big) {
			this.data.citySize = CitySize.big;
			citySizeChange = 1;
		}
		if (this.data.citySize == CitySize.middle && this.data.resCt < CityResCt.small) {
			this.data.citySize = CitySize.small;
			citySizeChange = 1;
		}
		if (this.data.citySize == CitySize.big && this.data.resCt < CityResCt.middle) {
			this.data.citySize = CitySize.middle;
			citySizeChange = 1;
		}		
		if (citySizeChange == 1) {
			for (var i=-CitySize.big; i<=CitySize.big; i++){
				for (var j=-CitySize.big; j<=CitySize.big; j++){
					mapMain.data.cells[this.data.posX+i][this.data.posY+j].cBase = CityBase.reserve;
				}
			}
			for (var i=-this.data.citySize; i<=this.data.citySize; i++){
				for (var j=-this.data.citySize; j<=this.data.citySize; j++){
					mapMain.data.cells[this.data.posX+i][this.data.posY+j].cBase = CityBase.zone;
					mapMain.data.cells[this.data.posX+i][this.data.posY+j].cId = this.data.id;
					mapMain.data.cells[this.data.posX+i][this.data.posY+j].cCult = this.data.id;
				}
			}
			mapMain.data.cells[this.data.posX][this.data.posY].cBase = CityBase.center;
		}
		
		//销毁城市
		if (peopleBorn == 0 && this.data.resCt < PeopleResCt.starve && this.data.pAliveList.length == 0) {
			for (var i=-CitySize.big; i<=CitySize.big; i++){
				for (var j=-CitySize.big; j<=CitySize.big; j++){
					mapMain.data.cells[this.data.posX+i][this.data.posY+j].cBase = CityBase.none;
					mapMain.data.cells[this.data.posX+i][this.data.posY+j].cId = CityId.none;
				}
			}	
			//城市销毁时，把文化也从地图上清除掉
			for (var i=0; i<glbData.mapCellSize; i++){
				for (var j=0; j<glbData.mapCellSize; j++){
					if (mapMain.data.cells[i][j].cCult == this.data.id) {
						mapMain.data.cells[i][j].cCult = CityId.none;
					}
				}
			}
			//确保清除城市对应人口
			for (var i=0; i<peopleList.length; i++) {
				if (peopleList[i] != null && peopleList[i].data.cId == this.data.id){
					peopleList[i].dead();
				}
			}
			var cityl = glbData.cAliveList;
			cityl.splice(cityl.indexOf(this.data.id), 1);
			this.data.alive = CityAlive.no;
		}
	}
}