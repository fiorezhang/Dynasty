class City{
	static idStatic = 0;
	
	constructor(size, culture, target){
		this.data = {'posX':0, 'posY':0, 'alive':CityAlive.no, 'resCt':0, 'dayCityNext':DayCity, 'dayPeopleNext':DayPeople, 'citySize':0, 'id':CityId.none, 'cult':CityCult.none, 'main':CityMain.no, 'fmName':'', 'cityName':'', 'territory':0, 'pAliveList':null, 'resCellList':null, 'tgtCell':{'posX':-1, 'posY':-1},};
		
		if (size == CitySize.none){	//专门设计给读档
			City.idStatic += 1;
			return;
		}

		//随机生成城市中心点，预留最大城市范围，碰撞检测是否与湖，资源，其它城市重叠
		var countRetry = 0;		
		var maxRetry = 100;
		var cityConflict = 0;
		//var cityBoundary = CitySize.big + 1;	//城市和其它城市，湖泊，矿物等间隔一格
		var cityBoundary = CitySize.big;	//城市和其它城市，湖泊，矿物等可以无间隔
		var distanceTry = 0;	//指定城市位置时，以指定位置开始，从0开始扩大搜索范围
		do{
			cityConflict = 0;
			this.data.posX = getRandom(0+cityBoundary, mapMain.data.cellSize-cityBoundary);
			this.data.posY = getRandom(0+cityBoundary, mapMain.data.cellSize-cityBoundary);
			
			//限定新生成分城的位置
			if (culture != CityCult.none && culture != null){
				this.data.cult = culture;
				var cityMainId = this.getMainCityId();	
				var cityMain = cityList[cityMainId];
				if (cityMain != null){
					if (target != null && target.posX != -1 && target.posY != -1) {
						this.data.posX = getRandom(Math.max(cityBoundary, target.posX-distanceTry), Math.min(mapMain.data.cellSize-cityBoundary, target.posX+distanceTry+1));
						this.data.posY = getRandom(Math.max(cityBoundary, target.posY-distanceTry), Math.min(mapMain.data.cellSize-cityBoundary, target.posY+distanceTry+1));
						distanceTry += 1;
						if (distanceTry > 2) {	//不要搜到太远距离
							distanceTry = 2;
						}
					}
					else {
						var distanceMax = Math.ceil(Math.sqrt(cityMain.data.territory));	//未指定城市位置时，从主城开始，限定最大搜索范围，随机产生位置
						this.data.posX = getRandom(Math.max(0, cityMain.data.posX-distanceMax)+cityBoundary, Math.min(mapMain.data.cellSize, cityMain.data.posX+distanceMax+1)-cityBoundary);
						this.data.posY = getRandom(Math.max(0, cityMain.data.posY-distanceMax)+cityBoundary, Math.min(mapMain.data.cellSize, cityMain.data.posY+distanceMax+1)-cityBoundary);
					}	
				}
			}
			//console.log("RETRY", culture, this.data.posX, this.data.posY);

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
		
		//console.log("DONE", countRetry, this.data.posX, this.data.posY);
		
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
		if (culture == CityCult.none || culture == null) {	//第一座城市，母城，初始主城
			this.data.cult = this.data.id;
			this.data.main = CityMain.yes;
			var nameConflict = 0;
			countRetry = 0;
			maxRetry = 10;
			do{
				nameConflict = 0;
				this.data.fmName = getFamilyName();
				for (var i=0; i<cityList.length; i++) {
					var city = cityList[i];
					if (city != null && city.data.fmName == this.data.fmName){
						nameConflict = 1;
						break;
					}
				}
				countRetry += 1;
			}while(nameConflict == 1 && countRetry < maxRetry);
		}
		else {
			this.data.cult = culture;
			var cityMainId = getMainCityId(this.data.cult); //文化ID和母城ID相同
			var cityMain = cityList[cityMainId];
			this.data.fmName = cityMain.data.fmName;
		}
		
		var nameConflict = 0;
		countRetry = 0;
		maxRetry = 10;
		do{
			nameConflict = 0;
			this.data.cityName = getCityName();
			for (var i=0; i<cityList.length; i++) {
				var city = cityList[i];
				if (city != null && city.data.cityName == this.data.cityName){
					nameConflict = 1;
					break;
				}
			}
			countRetry += 1;
		}while(nameConflict == 1 && countRetry < maxRetry);
		
		this.data.dayCityNext = getRandom(DayCity/2, DayCity*3/2);
		this.data.dayPeopleNext = getRandom(DayPeople/2, DayPeople*3/2);
		
		for (var i=-CitySize.big; i<=CitySize.big; i++){
			for (var j=-CitySize.big; j<=CitySize.big; j++){
				mapMain.data.cells[this.data.posX+i][this.data.posY+j].cBase = CityBase.reserve;
			}
		}
		for (var i=-this.data.citySize; i<=this.data.citySize; i++){
			for (var j=-this.data.citySize; j<=this.data.citySize; j++){
				mapMain.data.cells[this.data.posX+i][this.data.posY+j].cBase = CityBase.zone;
				mapMain.data.cells[this.data.posX+i][this.data.posY+j].cId = this.data.id;
				mapMain.data.cells[this.data.posX+i][this.data.posY+j].cCult = this.data.cult;
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
		
		addBio("【"+this.data.fmName+"】家族建城【"+this.data.cityName+"】城。");
	}
	
	dead(){
		//地图上清除
		for (var i=-CitySize.big; i<=CitySize.big; i++){
			for (var j=-CitySize.big; j<=CitySize.big; j++){
				mapMain.data.cells[this.data.posX+i][this.data.posY+j].cBase = CityBase.none;
				mapMain.data.cells[this.data.posX+i][this.data.posY+j].cId = CityId.none;
			}
		}		
		//确保清除城市对应人口
		for (var i=0; i<peopleList.length; i++) {
			if (peopleList[i] != null && peopleList[i].data.cId == this.data.id){
				peopleList[i].dead();
			}
		}		
		//从cityList清除
		var cityl = glbData.cAliveList;
		cityl.splice(cityl.indexOf(this.data.id), 1);
		this.data.alive = CityAlive.no;
		
		addBio("【"+this.data.fmName+"】家族【"+this.data.cityName+"】城消亡。")
	}
	
	command(){
		if (this.data.id == glbData.hltCityId && glbData.tgtSet == TargetSet.yes && ((glbData.playMode == PlayMode.no && this.data.main == CityMain.yes) || (glbData.playMode == PlayMode.yes && this.data.main == CityMain.yes && this.data.id == glbData.playCityId))) {
			this.data.tgtCell = {'posX':glbData.tgtCell.posX, 'posY':glbData.tgtCell.posY};
			this.data.tgtSet = TargetSet.yes;
			//console.log(this.data.tgtCell, this.data.tgtSet);
			glbData.tgtSet = TargetSet.no;
		}
	}

	getMainCityId() {
		var cityMainId = CityId.none;
		for (var i=0; i<glbData.cAliveList.length; i++) {
			if (cityList[glbData.cAliveList[i]].data.cult == this.data.cult && cityList[glbData.cAliveList[i]].data.main == CityMain.yes) {
				cityMainId = glbData.cAliveList[i];
			}
		}
		return cityMainId;
	}
	
	update(){
		var peopleBorn = 0;	//标记是否本轮生成市民
		//间隔一段时间，如果有足够资源，生成新的市民
		if (glbData.dayMain >= this.data.dayPeopleNext && this.data.pAliveList.length < PeopleNumIndex * this.data.citySize && this.data.resCt >= PeopleResCt.starve) {	//城市容纳人数为8x城市大小
			var resourceBorn = Math.min(this.data.resCt, PeopleResCt.standard);
			var people = new People(this.data.id, this.data.cult, resourceBorn);
			if (people.data.id != PeopleId.none){	//成功生成
				peopleBorn = 1;
				peopleList.push(people);
				this.data.resCt -= resourceBorn;
				this.data.dayPeopleNext = glbData.dayMain + getRandom(DayPeople/2, DayPeople*3/2);	//随机指定下一个生成市民的天数，平均值为设定的天数
			}	
		}
		
		this.command();
		
		//生成新分城市
		var cityBorn = 0;	
		//符合条件时，主城生成新的城市
		if (this.data.main == CityMain.yes && glbData.dayMain >= this.data.dayCityNext && glbData.cAliveList.length < CityNumMax) {	//主城
			var city = null;
			var cityBornResCt = CityResCt.none;
			var tgtPosition = {'posX':-1, 'posY':-1};
			if (this.data.tgtSet == TargetSet.yes) {
				tgtPosition = {'posX':this.data.tgtCell.posX, 'posY':this.data.tgtCell.posY};
				if (mapMain.data.cells[tgtPosition.posX][tgtPosition.posY].cBase > CityBase.none){ //指到别的城市上，就取消掉
					tgtPosition = null;
				}
			}
			if (this.data.citySize == CitySize.middle && this.data.resCt > CityResCt.middle + CityResCt.small) { //中城而且资源足够，分城后不会立刻降级
				cityBornResCt = CityResCt.small;
				var city = new City(CitySize.small, this.data.cult, tgtPosition);
			}
			else if (this.data.citySize == CitySize.big && this.data.resCt > CityResCt.big + CityResCt.middle) { //大城而且资源足够，分城后不会立刻降级
				cityBornResCt = CityResCt.middle;
				var city = new City(CitySize.middle, this.data.cult, tgtPosition);
			}
			if (city != null && city.data.id != CityId.none){	//成功生成
				cityBorn = 1;
				cityList.push(city);
				this.data.resCt -= cityBornResCt;//主城减去分城的初始资源
				this.data.dayCityNext = glbData.dayMain + getRandom(DayCity/2, DayCity*3/2);	//随机指定下一个生成市民的天数，平均值为设定的天数
				this.data.tgtSet = TargetSet.no;
			}
			else {
				this.data.dayCityNext = glbData.dayMain + getRandom(DayCityFail/2, DayCityFail*3/2);	//随机指定下一个生成市民的天数，平均值为设定的天数
			}
			//console.log(this.data.id, this.data.dayCityNext);
		}			

		//计算城市文化疆域
		this.data.territory = 0;
		for (var i=0; i<glbData.mapCellSize; i++){
			for (var j=0; j<glbData.mapCellSize; j++){
				if (mapMain.data.cells[i][j].cCult == this.data.cult) {
					this.data.territory += 1;
				}
			}
		}
		
		//分城如果比主城大，资源优先给主城
		var cityMainId = this.getMainCityId();
		var cityMain = cityList[cityMainId];
		if (this.data.citySize > cityMain.data.citySize) {
			var resCtDelta = this.data.resCt - cityMain.data.resCt;
			if (resCtDelta > 0) {
				this.data.resCt -= Math.ceil(resCtDelta/2);
				cityMain.data.resCt += Math.ceil(resCtDelta/2);
			}
		}
		
		//升级城市
		var citySizeChange = 0;
		if (this.data.citySize == CitySize.small && this.data.resCt > CityResCt.middle) {
			this.data.citySize = CitySize.middle;
			citySizeChange = 1;
			addBio("【"+this.data.fmName+"】家族【"+this.data.cityName+"】城升级中级城市。");
		}
		if (this.data.citySize == CitySize.middle && this.data.resCt > CityResCt.big) {
			this.data.citySize = CitySize.big;
			citySizeChange = 1;
			addBio("【"+this.data.fmName+"】家族【"+this.data.cityName+"】城升级高级城市。");
		}
		if (this.data.citySize == CitySize.middle && this.data.resCt < CityResCt.small) {
			this.data.citySize = CitySize.small;
			citySizeChange = 1;
			addBio("【"+this.data.fmName+"】家族【"+this.data.cityName+"】城降级初级城市。");
		}
		if (this.data.citySize == CitySize.big && this.data.resCt < CityResCt.middle) {
			this.data.citySize = CitySize.middle;
			citySizeChange = 1;
			addBio("【"+this.data.fmName+"】家族【"+this.data.cityName+"】城降级中级城市。");
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
					mapMain.data.cells[this.data.posX+i][this.data.posY+j].cCult = this.data.cult;
				}
			}
			mapMain.data.cells[this.data.posX][this.data.posY].cBase = CityBase.center;
		}

		//主城迁都
		if (this.data.tgtSet == TargetSet.yes && this.data.main == CityMain.yes && mapMain.data.cells[this.data.tgtCell.posX][this.data.tgtCell.posY].cBase == CityBase.center 
			&& mapMain.data.cells[this.data.tgtCell.posX][this.data.tgtCell.posY].cCult == this.data.cult && mapMain.data.cells[this.data.tgtCell.posX][this.data.tgtCell.posY].cId != this.data.id) {
			var thisCityId = this.data.id;																//交换城市ID
			var tgtCityId = mapMain.data.cells[this.data.tgtCell.posX][this.data.tgtCell.posY].cId;
			var tgtCity = cityList[tgtCityId];
			this.data.main = CityMain.no;
			tgtCity.data.main = CityMain.yes;
			tgtCity.data.dayCityNext = this.data.dayCityNext;
			
			this.data.tgtSet = TargetSet.no;
			
			addBio("【"+this.data.fmName+"】家族【"+this.data.cityName+"】城迁都【"+tgtCity.data.cityName+"】城。");
		}
	
		
		//销毁城市
		if (peopleBorn == 0 && cityBorn == 0 && this.data.resCt < PeopleResCt.starve && this.data.pAliveList.length == 0) {
			//如果是主城，确保清除其它城以及文化
			if (this.data.main == CityMain.yes) {
				var fmName = this.data.fmName; //缓存文化名
				for (var i=0; i<cityList.length; i++) {
					var city = cityList[i];
					if (city != null && this.data.cult == city.data.cult) {
						city.dead();
					}
				}
				//主城销毁时，把文化也从地图上清除掉
				for (var i=0; i<glbData.mapCellSize; i++){
					for (var j=0; j<glbData.mapCellSize; j++){
						if (mapMain.data.cells[i][j].cCult == this.data.cult) {
							mapMain.data.cells[i][j].cCult = CityCult.none;
						}
					}
				}
				addBio("【"+fmName+"】家族退出历史的舞台。")
			}
			else {
				this.dead();
			}
		}
	}
}