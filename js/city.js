class City{
	static idStatic = 0;
	
	constructor(size){
		this.data = {'posX':0, 'posY':0, 'alive':Cityalive.no, 'resource':0, 'dayNext':Daypeople, 'citySize':0, 'id':Cityid.none, 'familyName':'', 'peopleidlist':null, 'rescelllist':null};
		
		if (size == Citysize.none){	//专门设计给读档
			City.idStatic += 1;
			return;
		}

		//随机生成城市中心点，预留最大城市范围，碰撞检测是否与湖，资源，其它城市重叠
		var countRetry = 0;		
		var maxRetry = 1000;
		var cityConflict = 0;
		var cityBoundary = Citysize.big + 1;
		do{
			cityConflict = 0;
			this.data.posX = getRandom(0+cityBoundary, mapMain.data.cellSize-cityBoundary);
			this.data.posY = getRandom(0+cityBoundary, mapMain.data.cellSize-cityBoundary);
			//console.log(this.data.posX);
			//console.log(this.data.posY);

			for (var i=-cityBoundary; i<=cityBoundary; i++){
				for (var j=-cityBoundary; j<=cityBoundary; j++){
				if (mapMain.data.cells[this.data.posX+i][this.data.posY+j].terrain != Terrain.none || mapMain.data.cells[this.data.posX+i][this.data.posY+j].resource != Resource.none || mapMain.data.cells[this.data.posX+i][this.data.posY+j].citybase > Citybase.none){
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
			this.data.id = Cityid.none;
			return;
		}
		
		//确认城市中心点后，根据输入的城市尺寸，更新地图cell信息；生成唯一id
		this.data.citySize = size;		
		this.data.alive = Cityalive.yes;
		this.data.id = City.idStatic;
		City.idStatic += 1;				
		//console.log(this.data.id);		
		this.data.familyName = getFamilyName();
		this.data.dayNext = getRandom(1, Daypeople*2);
		
		for (var i=-Citysize.big; i<=Citysize.big; i++){
			for (var j=-Citysize.big; j<=Citysize.big; j++){
				mapMain.data.cells[this.data.posX+i][this.data.posY+j].citybase = Citybase.reserve;
			}
		}
		for (var i=-this.data.citySize; i<=this.data.citySize; i++){
			for (var j=-this.data.citySize; j<=this.data.citySize; j++){
				mapMain.data.cells[this.data.posX+i][this.data.posY+j].citybase = Citybase.zone;
				mapMain.data.cells[this.data.posX+i][this.data.posY+j].cityid = this.data.id;
			}
		}
		mapMain.data.cells[this.data.posX][this.data.posY].citybase = Citybase.center;
		
		//城市初始资源
		if (this.data.citySize == Citysize.small) {
			this.data.resource = Cityresource.small;
		}
		else if (this.data.citySize == Citysize.middle) {
			this.data.resource = Cityresource.middle;
		}
		else if (this.data.citySize == Citysize.big) {
			this.data.resource = Cityresource.big;
		}
		
		//建立城市人口list
		this.data.peopleidlist = new Array();
		
		//建立资源list
		this.data.rescelllist = new Array();
	}
	
	update(day){
		//间隔一段时间，如果有足够资源，生成新的市民
		if (day >= this.data.dayNext && this.data.peopleidlist.length < PeopleNumIndex * this.data.citySize && this.data.resource >= Peopleresource.starve) {	//城市容纳人数为8x城市大小
			var resourceBorn = Math.min(this.data.resource, Peopleresource.standard);
			var people = new People(this.data.id, resourceBorn);
			if (people.data.id != Peopleid.none){	//成功生成
				peopleList.push(people);
				this.data.resource -= resourceBorn;
				this.data.dayNext = day + getRandom(1, Daypeople*2);	//随机指定下一个生成市民的天数，平均值为设定的天数
			}	
		}
		
		//升级城市
		var citySizeChange = 0;
		if (this.data.citySize == Citysize.small && this.data.resource > Cityresource.middle) {
			this.data.citySize = Citysize.middle;
			citySizeChange = 1;
		}
		if (this.data.citySize == Citysize.middle && this.data.resource > Cityresource.big) {
			this.data.citySize = Citysize.big;
			citySizeChange = 1;
		}
		if (this.data.citySize == Citysize.middle && this.data.resource < Cityresource.small) {
			this.data.citySize = Citysize.small;
			citySizeChange = 1;
		}
		if (this.data.citySize == Citysize.big && this.data.resource < Cityresource.middle) {
			this.data.citySize = Citysize.middle;
			citySizeChange = 1;
		}		
		if (citySizeChange == 1) {
			for (var i=-Citysize.big; i<=Citysize.big; i++){
				for (var j=-Citysize.big; j<=Citysize.big; j++){
					mapMain.data.cells[this.data.posX+i][this.data.posY+j].citybase = Citybase.reserve;
				}
			}
			for (var i=-this.data.citySize; i<=this.data.citySize; i++){
				for (var j=-this.data.citySize; j<=this.data.citySize; j++){
					mapMain.data.cells[this.data.posX+i][this.data.posY+j].citybase = Citybase.zone;
					mapMain.data.cells[this.data.posX+i][this.data.posY+j].cityid = this.data.id;
				}
			}
			mapMain.data.cells[this.data.posX][this.data.posY].citybase = Citybase.center;
		}
		
		//销毁城市
		if (this.data.resource < Peopleresource.starve && this.data.peopleidlist.length == 0) {
			for (var i=-Citysize.big; i<=Citysize.big; i++){
				for (var j=-Citysize.big; j<=Citysize.big; j++){
					mapMain.data.cells[this.data.posX+i][this.data.posY+j].citybase = Citybase.none;
					mapMain.data.cells[this.data.posX+i][this.data.posY+j].cityid = Cityid.none;
				}
			}	
			this.data.alive = Cityalive.no;
		}
	}
}